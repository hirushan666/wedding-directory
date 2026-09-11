import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { OfferingEntity } from 'src/database/entities/offering.entity';
import { PackageEntity } from 'src/database/entities/package.entity';
import { ReviewEntity } from 'src/database/entities/review.entity';
import { Repository } from 'typeorm';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';

type RankedVendor = {
  offeringId: string;
  offeringName: string;
  category: string;
  vendorName: string;
  city: string;
  location: string;
  rating: number;
  minPackagePrice: number | null;
  deterministicScore: number;
  reason: string;
  aiReview?: string;
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  photo: ['photography', 'photographer', 'photographers'],
  video: ['videography', 'videographer', 'videographers'],
  venue: ['venue', 'venues'],
  suit: ['suit', 'suits', 'dress', 'dresses', 'suits and dresses'],
  jewel: ['jewellery', 'jewelry', 'jewelery'],
  makeup: ['makeup', 'hair and makeup'],
  music: ['music', 'dj', 'band'],
  decor: ['decor', 'decoration', 'florist', 'florists'],
};

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectRepository(OfferingEntity)
    private readonly offeringRepository: Repository<OfferingEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async recommendForVisitor(input: RecommendationRequestDto) {
    const normalized = this.normalizeInput(input);
    const offerings = await this.findCandidateOfferings(normalized);
    const aiEnabled = Boolean(this.configService.get<string>('GROQ_API_KEY'));

    if (offerings.length === 0) {
      return {
        source: 'rules',
        ai: {
          enabled: aiEnabled,
          used: false,
          reason: 'no_candidates',
        },
        recommendations: [],
      };
    }

    const ratingMap = await this.getAverageRatings(
      offerings.map((offering) => offering.id),
    );

    const deterministicRanked = offerings
      .map((offering) =>
        this.toRankedVendor(offering, ratingMap.get(offering.id) || 0, normalized),
      )
      .sort((left, right) => right.deterministicScore - left.deterministicScore)
      .slice(0, 20);

    const aiResult = await this.rankWithGroq(deterministicRanked, normalized);
    const aiRanked = aiResult.ranked;
    const finalList = (aiRanked || deterministicRanked).slice(0, normalized.limit);

    return {
      source: aiRanked ? 'ai' : 'rules',
      ai: {
        enabled: aiEnabled,
        used: Boolean(aiRanked),
        reason: aiRanked ? 'success' : aiResult.reason,
      },
      recommendations: finalList,
    };
  }

  private normalizeInput(input: RecommendationRequestDto) {
    const categories = (input.categories || [])
      .flatMap((value) => this.expandCategoryTerms(value))
      .filter(Boolean);

    return {
      location: input.location?.trim().toLowerCase() || '',
      budget: Number(input.budget) > 0 ? Number(input.budget) : null,
      categories,
      notes: input.notes?.trim() || '',
      limit:
        Number(input.limit) > 0
          ? Math.min(Number(input.limit), 12)
          : 6,
    };
  }

  private async findCandidateOfferings(input: {
    location: string;
    categories: string[];
    budget: number | null;
  }) {
    const query = this.offeringRepository
      .createQueryBuilder('offering')
      .leftJoinAndSelect('offering.vendor', 'vendor')
      .leftJoinAndSelect('offering.packages', 'pkg')
      .where('offering.visible = :visible', { visible: true });

    if (input.location) {
      query.andWhere(
        '(LOWER(vendor.city) LIKE :location OR LOWER(vendor.location) LIKE :location)',
        {
          location: `%${input.location}%`,
        },
      );
    }

    const offerings = await query.getMany();

    const offeringsAfterCategoryFilter =
      input.categories.length > 0
        ? offerings.filter((offering) =>
            this.matchesCategoryPreference(offering.category || '', input.categories),
          )
        : offerings;

    if (!input.budget) {
      return offeringsAfterCategoryFilter;
    }

    return offeringsAfterCategoryFilter.filter((offering) => {
      const minPackagePrice = this.getMinVisiblePackagePrice(offering.packages || []);
      return minPackagePrice === null || minPackagePrice <= input.budget * 1.3;
    });
  }

  private async getAverageRatings(offeringIds: string[]) {
    if (offeringIds.length === 0) {
      return new Map<string, number>();
    }

    const rows = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.offering_id', 'offeringId')
      .addSelect('AVG(review.rating)', 'avgRating')
      .where('review.offering_id IN (:...offeringIds)', { offeringIds })
      .groupBy('review.offering_id')
      .getRawMany<{ offeringId: string; avgRating: string }>();

    const ratingMap = new Map<string, number>();
    for (const row of rows) {
      ratingMap.set(row.offeringId, Number(row.avgRating));
    }

    return ratingMap;
  }

  private toRankedVendor(
    offering: OfferingEntity,
    rating: number,
    input: { location: string; budget: number | null; categories: string[]; notes: string },
  ): RankedVendor {
    const minPackagePrice = this.getMinVisiblePackagePrice(offering.packages || []);
    const lowerCategory = (offering.category || '').toLowerCase();
    const city = offering.vendor?.city || '';
    const location = offering.vendor?.location || '';

    let score = 0;
    const reasons: string[] = [];

    if (input.categories.length === 0 || this.matchesCategoryPreference(lowerCategory, input.categories)) {
      score += 35;
      reasons.push(`matches ${offering.category} category`);
    }

    const cityMatch = input.location && city.toLowerCase().includes(input.location);
    const locationMatch =
      input.location && !cityMatch && location.toLowerCase().includes(input.location);

    if (cityMatch) {
      score += 25;
      reasons.push(`located in ${city}`);
    } else if (locationMatch) {
      score += 12;
      reasons.push('close to preferred location');
    }

    if (input.budget && minPackagePrice !== null) {
      const budgetDiff = Math.abs(minPackagePrice - input.budget) / input.budget;
      score += Math.max(0, 25 - budgetDiff * 25);

      if (minPackagePrice <= input.budget) {
        score += 5;
        reasons.push('within your budget');
      } else {
        reasons.push('slightly above your budget');
      }
    }

    if (rating > 0) {
      score += Math.min(20, rating * 4);
      reasons.push(`${rating.toFixed(1)}★ average rating`);
    }

    if (input.notes && this.matchesNotes(input.notes, offering)) {
      score += 8;
      reasons.push('matches your style preferences');
    }

    return {
      offeringId: offering.id,
      offeringName: offering.name,
      category: offering.category,
      vendorName: offering.vendor?.busname || 'Unknown Vendor',
      city,
      location,
      rating: Number(rating.toFixed(2)),
      minPackagePrice,
      deterministicScore: Number(score.toFixed(2)),
      reason: reasons.slice(0, 3).join(', ') || 'recommended by availability and profile quality',
    };
  }

  private matchesNotes(notes: string, offering: OfferingEntity) {
    const haystack = `${offering.name} ${offering.description || ''} ${offering.category}`.toLowerCase();
    const keywords = notes
      .toLowerCase()
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter((value) => value.length > 3);

    return keywords.some((keyword) => haystack.includes(keyword));
  }

  private getMinVisiblePackagePrice(packages: PackageEntity[]) {
    const visiblePackages = packages.filter((pkg) => pkg.visible);
    if (visiblePackages.length === 0) {
      return null;
    }

    const prices = visiblePackages
      .map((pkg) => Number(pkg.pricing))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
      return null;
    }

    return Math.min(...prices);
  }

  private async rankWithGroq(
    deterministicRanked: RankedVendor[],
    input: {
      location: string;
      budget: number | null;
      categories: string[];
      notes: string;
      limit: number;
    },
  ): Promise<{ ranked: RankedVendor[] | null; reason: string }> {
    const rawGroqKey = this.configService.get<string>('GROQ_API_KEY');
    const groqKey = rawGroqKey ? rawGroqKey.toString().trim().replace(/^['"]+|['"]+$/g, '') : '';
    const rawModel = this.configService.get<string>('GROQ_RECOMMENDER_MODEL');
    const rawEndpoint = this.configService.get<string>('GROQ_RECOMMENDER_ENDPOINT');

    const configuredModel = (rawModel || 'openai/gpt-oss-20b')
      .toString()
      .trim()
      .replace(/^['"]+|['"]+$/g, '');

    const endpointUrl = (rawEndpoint || 'https://api.groq.com/openai/v1/chat/completions')
      .toString()
      .trim()
      .replace(/^['"]+|['"]+$/g, '');

    if (!groqKey) {
      this.logger.warn('Groq ranking disabled: missing GROQ_API_KEY');
      return { ranked: null, reason: 'missing_groq_api_key' };
    }

    // Log masked API key info for diagnostics (do NOT log the full key)
    try {
      const visible = groqKey.length > 8 ? `${groqKey.slice(0,4)}...${groqKey.slice(-4)}` : '****';
      this.logger.debug(`Groq API key present (masked): ${visible}, length: ${groqKey.length}`);
    } catch {}

    // Fetch recent review comments for candidates so the model can summarize sentiment
    const offeringIds = deterministicRanked.map((d) => d.offeringId);
    let commentsRows: Array<{ offeringId: string; comment: string | null }> = [];
    if (offeringIds.length > 0) {
      try {
        commentsRows = await this.reviewRepository
          .createQueryBuilder('review')
          .select('review.offering_id', 'offeringId')
          .addSelect('review.comment', 'comment')
          .where('review.offering_id IN (:...offeringIds)', { offeringIds })
          .orderBy('review.created_at', 'DESC')
          .getRawMany();
      } catch (e) {
        this.logger.debug('Failed to load review comments for Groq prompt', String(e));
        commentsRows = [];
      }
    }

    const commentsMap = new Map<string, string[]>();
    for (const r of commentsRows) {
      if (!r || !r.offeringId) continue;
      const list = commentsMap.get(r.offeringId) || [];
      if (typeof r.comment === 'string' && r.comment.trim()) list.push(r.comment.trim());
      commentsMap.set(r.offeringId, list);
    }

    const enrichedCandidates = deterministicRanked.map((item) => ({
      ...item,
      reviews: commentsMap.get(item.offeringId) || [],
    }));

    const prompt = this.buildRankingPrompt(enrichedCandidates, input);

    // Log configured endpoint and model for debugging (do not log the API key)
    this.logger.debug(`Groq endpoint configured: ${endpointUrl}`);
    this.logger.debug(`Groq model configured: ${configuredModel}`);

    // Prepare endpointToUse and validate URL to avoid unclear errors from undici
    let endpointToUse = endpointUrl;
    try {
      // sanitize further: remove BOM and control whitespace
      const cleaned = endpointUrl.replace(/^[\uFEFF\u00A0\s]+|[\uFEFF\u00A0\s]+$/g, '').replace(/\s+/g, '');

      // If cleaning changed it, log both forms for diagnostics
      if (cleaned !== endpointUrl) {
        this.logger.debug(`Groq endpoint raw: ${JSON.stringify(endpointUrl)}`);
        this.logger.debug(`Groq endpoint cleaned: ${JSON.stringify(cleaned)}`);
      }

      // Log length and char codes to catch hidden characters
      const codes = Array.from(endpointUrl).map((c) => c.charCodeAt(0));
      this.logger.debug(`Groq endpoint length: ${endpointUrl.length}, codes: ${codes.slice(0,50).join(',')}${codes.length>50?',...':''}`);

      // eslint-disable-next-line no-new
      new URL(cleaned);
      endpointToUse = cleaned;
    } catch (err) {
      this.logger.warn(`Groq ranking failed: Invalid URL (${endpointUrl})`);
      // Safely extract stack/message from unknown error
      let errMessage: string;
      if (err && typeof err === 'object' && 'stack' in err) {
        // @ts-ignore - we've checked for 'stack' property presence
        errMessage = (err as { stack?: string }).stack || String(err);
      } else {
        errMessage = String(err);
      }
      this.logger.debug('URL validation error', errMessage);
      this.logger.debug('Invalid endpoint diagnostics', { raw: endpointUrl });
      return { ranked: null, reason: 'invalid_groq_endpoint' };
    }

    try {
      const response = await firstValueFrom(
  this.httpService.post(
    endpointUrl,
    {
      model: configuredModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500, // bumped up — see reasoning-token note below
      temperature: 0.0,
    },
    {
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
      proxy: false,
    },
  ),
);

      const generatedText = this.extractGeneratedText(response.data);
      this.logger.debug(`Groq raw content: [${generatedText}]`);
      this.logger.debug(`Groq finish_reason: ${response.data?.choices?.[0]?.finish_reason}`);

      const parsed = this.extractRankedJson(generatedText);
      if (!parsed) {
        return { ranked: null, reason: 'invalid_groq_response' };
      }

      const rankMap = new Map(deterministicRanked.map((item) => [item.offeringId, item]));

      // Debug: log candidate IDs and compare with parsed ids
      const candidateIds = deterministicRanked.map((d) => d.offeringId);
      this.logger.debug(`Groq candidates count: ${candidateIds.length}`, { candidateIds: candidateIds.slice(0, 50) });
      this.logger.debug(`Groq parsed ranked_ids: ${parsed.ranked_ids.slice(0, 50)}`);

      const matchedIds = parsed.ranked_ids.filter((id) => rankMap.has(id));
      const unmatchedIds = parsed.ranked_ids.filter((id) => !rankMap.has(id));
      this.logger.debug(`Groq matched ids: ${matchedIds}`);
      if (unmatchedIds.length > 0) {
        this.logger.debug(`Groq returned unknown ids (not in candidates): ${unmatchedIds.slice(0,50)}`);
      }

      const ranked = matchedIds
        .map((id) => rankMap.get(id)!)
        .map((item) => ({
          ...item,
          reason: parsed.reasons?.[item.offeringId] || item.reason,
          aiReview:
            (parsed.short_review && parsed.short_review[item.offeringId]) ||
            parsed.reasons?.[item.offeringId] ||
            item.reason,
        }));

      if (ranked.length === 0) {
        this.logger.debug('Groq returned no candidate matches; falling back to deterministic ranking');
        return { ranked: null, reason: 'empty_groq_ranking' };
      }

      const remaining = deterministicRanked.filter(
        (item) => !ranked.some((rankedItem) => rankedItem.offeringId === item.offeringId),
      );

      return {
        ranked: [...ranked, ...remaining].slice(0, input.limit),
        reason: `success:groq:${configuredModel}`,
      };
    } catch (error) {
      // Try to extract axios/http error details
      let message = 'unknown_error';
      try {
        if (error && typeof error === 'object') {
          const anyErr = error as any;
          if (anyErr.response) {
            const status = anyErr.response.status;
            const data = anyErr.response.data;
            message = `Request failed with status code ${status}`;
            this.logger.debug('Groq response error', { status, data });
          } else if ('message' in anyErr) {
            message = String(anyErr.message);
          } else {
            message = String(anyErr);
          }
        }
      } catch (e) {
        message = String(error);
      }

      this.logger.warn(`Groq ranking failed: ${message}`);
      return { ranked: null, reason: `groq_request_failed:${message}` };
    }
  }

  private normalizeCategory(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private expandCategoryTerms(value: string) {
    const normalized = this.normalizeCategory(value);
    if (!normalized) {
      return [];
    }

    const expanded = new Set<string>([normalized]);
    const singular = normalized.endsWith('s') ? normalized.slice(0, -1) : normalized;
    expanded.add(singular);

    for (const aliasList of Object.values(CATEGORY_ALIASES)) {
      if (aliasList.some((alias) => normalized.includes(alias) || alias.includes(normalized))) {
        for (const alias of aliasList) {
          expanded.add(alias);
          if (alias.endsWith('s')) {
            expanded.add(alias.slice(0, -1));
          }
        }
      }
    }

    return Array.from(expanded);
  }

  private matchesCategoryPreference(category: string, preferences: string[]) {
    const normalizedCategory = this.normalizeCategory(category);
    const expandedCategory = this.expandCategoryTerms(normalizedCategory);

    return preferences.some((preference) =>
      expandedCategory.some(
        (candidate) =>
          candidate.includes(preference) ||
          preference.includes(candidate) ||
          normalizedCategory.includes(preference),
      ),
    );
  }

  private buildRankingPrompt(
    candidates: Array<RankedVendor & { reviews?: string[] }>,
    input: {
      location: string;
      budget: number | null;
      categories: string[];
      notes: string;
      limit: number;
    },
  ) {
    return `You are ranking wedding vendor offerings.
  Return ONLY valid JSON (no markdown), following this schema:
  {"ranked_ids":["offeringId1","offeringId2"],"reasons":{"offeringId1":"short reason","offeringId2":"short reason"},"short_review":{"offeringId1":"one-line summary","offeringId2":"one-line summary"}}

  User preferences:
  - location: ${input.location || 'not specified'}
  - budget: ${input.budget ?? 'not specified'}
  - categories: ${input.categories.join(', ') || 'not specified'}
  - notes: ${input.notes || 'not specified'}
  - top_limit: ${input.limit}

  Candidates (each candidate may include 'reviews' - an array of recent review comments):
  ${JSON.stringify(candidates, null, 2)}

  Rules:
  - Prioritize category and location fit.
  - Prefer options within budget.
  - Consider rating.
  - Keep reasons under 20 words.
  - For each candidate return a separate 'short_review' (one-line, max 20 words) that summarizes overall sentiment and key facts.
  - You MAY use vendor review comments provided in the 'reviews' field to inform the short_review (for example, if reviews say "bad" summarize as "multiple guests reported poor experience").
  - Do NOT copy any review text verbatim; always paraphrase and avoid repeating exact reviewer words or punctuation.
  - If no reviews exist for a candidate, summarize from attributes (category, rating, price, location, and how well it matches preferences).
  - 'short_review' must be concise and factual; avoid invented details and do not include markdown.
  - ranked_ids must contain only provided offeringId values.`;
  }

  private ensureFastestPolicy(modelId: string) {
    return modelId.includes(':') ? modelId : `${modelId}:fastest`;
  }

  private extractGeneratedText(data: unknown) {
    if (Array.isArray(data) && typeof (data[0] as { generated_text?: string })?.generated_text === 'string') {
      return (data[0] as { generated_text: string }).generated_text;
    }

    if (
      typeof data === 'object' &&
      data &&
      'choices' in data &&
      Array.isArray((data as { choices?: Array<{ message?: { content?: string } }> }).choices)
    ) {
      const choices = (data as { choices: Array<{ message?: { content?: string } }> }).choices;
      const content = choices[0]?.message?.content;
      if (typeof content === 'string') {
        return content;
      }
    }

    if (typeof data === 'object' && data && 'generated_text' in data) {
      const maybeText = (data as { generated_text?: string }).generated_text;
      if (typeof maybeText === 'string') {
        return maybeText;
      }
    }

    return '';
  }

  private extractRankedJson(rawText: string): {
    ranked_ids: string[];
    reasons?: Record<string, string>;
    short_review?: Record<string, string>;
  } | null {
    if (!rawText) {
      return null;
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        ranked_ids?: string[];
        reasons?: Record<string, string>;
        short_review?: Record<string, string>;
      };

      if (!Array.isArray(parsed.ranked_ids)) {
        return null;
      }

      return {
        ranked_ids: parsed.ranked_ids,
        reasons: parsed.reasons || {},
        short_review: parsed.short_review || {},
      };
    } catch {
      return null;
    }
  }
}
