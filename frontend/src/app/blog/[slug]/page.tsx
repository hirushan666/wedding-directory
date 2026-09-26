"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import PortableTextRenderer from "@/components/blog/PortableTextRenderer";
import { getBlogPostBySlug, SanityPost } from "@/sanity/client";
import { getBlogAssetUrl } from "@/api/blog/blog.api";
import { urlForImage } from "@/sanity/image";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<SanityPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  // Calculate reading time
  const calculateReadingTime = (textOrBody: any) => {
    const wordsPerMinute = 200;
    if (typeof textOrBody === "string") {
      const words = textOrBody.split(/\s+/).length;
      return Math.max(1, Math.ceil(words / wordsPerMinute));
    }
    // Estimated for blocks
    if (Array.isArray(textOrBody)) {
      const wordCount = textOrBody
        .filter((block: any) => block._type === "block" && block.children)
        .flatMap((block: any) => block.children.map((c: any) => c.text || ""))
        .join(" ")
        .split(/\s+/).length;
      return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }
    return 3;
  };

  useEffect(() => {
    let isMounted = true;
    const loadBlogPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getBlogPostBySlug(slug);
        if (isMounted) {
          if (!data) {
            setError("Blog post not found.");
          } else {
            setPost(data);
            if (data.title) {
              document.title = `${data.title} | Say I Do`;
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          setError(`Failed to load blog post: ${errorMessage}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBlogPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Add reading progress tracking
  useEffect(() => {
    const scrollHandler = () => {
      if (!articleRef.current) return;

      const totalHeight = articleRef.current.clientHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      if (scrollTop > 100) {
        const scrolled = (scrollTop - 100) / (totalHeight - windowHeight);
        setReadingProgress(Math.min(Math.max(scrolled * 100, 0), 100));
      } else {
        setReadingProgress(0);
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  // Share functionality
  const handleShare = (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = post?.title || "Say I Do Wedding Article";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "pinterest": {
        const imageUrl = resolveImageUrl() || "";
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            url
          )}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(
            title
          )}`,
          "_blank"
        );
        break;
      }
      case "clipboard":
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
        break;
    }
  };

  const resolveImageUrl = (): string | null => {
    if (!post) return null;
    if (post.coverImageUrl) return post.coverImageUrl;
    if (post.coverImage) {
      try {
        const url = urlForImage(post.coverImage)?.width(1400).url();
        if (url) return url;
      } catch {
        // ignore
      }
    }
    const legacyPost = post as any;
    if (legacyPost.CoverImage?.url) {
      return getBlogAssetUrl(legacyPost.CoverImage.url);
    }
    return null;
  };

  const imageUrl = resolveImageUrl();
  const postTitle = post?.title || (post as any)?.Title || "Wedding Article";
  const postAuthor = post?.author || (post as any)?.Author || "Wedding Expert";
  const postDate = post?.publishedAt || (post as any)?.createdAt || new Date().toISOString();
  const rawContent = post?.body || post?.content || (post as any)?.Content || "";
  const readingTime = calculateReadingTime(rawContent);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body transition-colors duration-200">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
          <Link
            href="/blog"
            className="text-orange hover:text-orange/80 mb-6 inline-flex items-center font-semibold text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Blog
          </Link>

          <div className="bg-white dark:bg-darkSurface border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-pulse relative">
            <div className="h-64 sm:h-72 bg-gray-200 dark:bg-darkElevated"></div>
            <div className="p-6 md:p-8">
              <div className="h-8 bg-gray-200 dark:bg-darkElevated rounded-xl w-3/4 mb-4"></div>
              <div className="flex space-x-4 mb-8">
                <div className="h-4 bg-gray-200 dark:bg-darkElevated rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-darkElevated rounded w-32"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-darkElevated rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-darkElevated rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-darkElevated rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-darkElevated rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body transition-colors duration-200">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex items-center justify-center">
          <div className="bg-white dark:bg-darkSurface border border-gray-100 dark:border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-sm max-w-md w-full text-center">
            <svg
              className="w-16 h-16 text-orange mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold font-title mb-3 text-gray-900 dark:text-zinc-100">
              Article Not Found
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">
              The article you are looking for might have been moved or doesn&apos;t exist.
            </p>
            <Link
              href="/blog"
              className="bg-orange hover:bg-orange/90 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors inline-block text-sm"
            >
              ← Back to All Articles
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body transition-colors duration-200">
      <Header />

      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange to-amber-500 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      ></div>

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        <div>
          <Link
            href="/blog"
            className="text-orange hover:text-orange/80 mb-6 sm:mb-8 inline-flex items-center group font-semibold text-sm"
          >
            <svg
              className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Blog
          </Link>

          <article
            ref={articleRef}
            className="bg-white dark:bg-darkSurface border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Hero Image Section with elegant overlay */}
            {imageUrl ? (
              <div className="relative h-64 sm:h-96 md:h-[480px] w-full bg-gray-900">
                <Image
                  src={imageUrl}
                  alt={postTitle}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  className="brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                  <div className="max-w-3xl">
                    {post.category && (
                      <span className="inline-block bg-orange/90 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-xs">
                        {post.category.title}
                      </span>
                    )}
                    <h1 className="font-title text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                      {postTitle}
                    </h1>
                    <div className="flex items-center text-white/90 space-x-6 flex-wrap text-xs sm:text-sm">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {postAuthor}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {new Date(postDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {readingTime} min read
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 border-b border-gray-100 dark:border-zinc-800 bg-gradient-to-r from-orange/5 to-amber-500/5">
                <div className="max-w-3xl mx-auto">
                  {post.category && (
                    <span className="inline-block bg-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {post.category.title}
                    </span>
                  )}
                  <h1 className="font-title text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-zinc-100">
                    {postTitle}
                  </h1>
                  <div className="flex items-center text-gray-500 dark:text-zinc-400 space-x-6 flex-wrap text-sm">
                    <span>By {postAuthor}</span>
                    <span>
                      {new Date(postDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section: Portable Text or Markdown */}
            <div className="p-6 md:p-12">
              <div className="max-w-3xl mx-auto">
                {post.body ? (
                  <PortableTextRenderer value={post.body} />
                ) : (
                  <div
                    className="prose prose-lg max-w-none font-body 
                               prose-headings:font-title prose-headings:text-gray-900 dark:prose-headings:text-zinc-100
                               prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                               prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                               prose-p:leading-relaxed prose-p:mb-6 prose-p:text-gray-700 dark:prose-p:text-zinc-300
                               prose-li:text-gray-700 dark:prose-li:text-zinc-300
                               prose-a:text-orange prose-a:no-underline hover:prose-a:underline 
                               prose-img:rounded-xl prose-img:shadow-md
                               prose-blockquote:border-orange prose-blockquote:bg-orange/5 dark:prose-blockquote:bg-darkElevated prose-blockquote:p-4 prose-blockquote:rounded-r-lg dark:prose-blockquote:text-zinc-200
                               prose-ul:my-6 prose-ol:my-6
                               prose-li:mb-2 
                               prose-hr:border-gray-200 dark:prose-hr:border-zinc-800 prose-hr:my-12"
                  >
                    <ReactMarkdown>
                      {typeof post.content === "string"
                        ? post.content
                        : (post as any).Content || ""}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Share buttons */}
                <div className="mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-3">
                        Share This Post
                      </h3>
                      <div className="flex space-x-3 items-center">
                        <button
                          type="button"
                          onClick={() => handleShare("facebook")}
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent dark:border-zinc-700 cursor-pointer"
                          aria-label="Share on Facebook"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 8H6v4h3v12h5V12h3.6l.4-4h-4V6.3c0-1.1.4-1.8 1.8-1.8H18V1h-3.4C10.8 1 9 2.6 9 5.6V8z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare("twitter")}
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:text-blue-400 transition-colors border border-transparent dark:border-zinc-700 cursor-pointer"
                          aria-label="Share on Twitter"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.013 10.013 0 01-3.127 1.196 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.666 2.476c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare("pinterest")}
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:text-red-600 transition-colors border border-transparent dark:border-zinc-700 cursor-pointer"
                          aria-label="Share on Pinterest"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.4.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare("clipboard")}
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-green-100 dark:hover:bg-green-900/30 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:text-green-600 transition-colors border border-transparent dark:border-zinc-700 cursor-pointer"
                          aria-label="Copy Link"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3 3 3 0 00-3 3h2a1 1 0 112 0v4a3 3 0 11-6 0V7a1 1 0 112 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {copied && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-semibold animate-fade-in">
                            Link copied!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Author section with full dark mode support */}
          <div className="bg-white dark:bg-darkSurface border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mt-8 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-orange/10 dark:bg-darkElevated flex items-center justify-center overflow-hidden flex-shrink-0 text-orange">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100 mb-1">
                  {postAuthor}
                </h3>
                <p className="text-xs uppercase tracking-wider text-orange font-semibold mb-2">
                  Say I Do Editorial Contributor
                </p>
                <p className="text-gray-600 dark:text-zinc-400 text-sm font-body leading-relaxed max-w-2xl">
                  Wedding planning specialist and lifestyle curator with years of experience helping
                  couples bring their dream celebrations to life across Sri Lanka and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
