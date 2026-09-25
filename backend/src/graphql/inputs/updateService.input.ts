import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateServiceInput {

    @Field({ nullable: true })
    category?: string;

    @Field({ nullable: true })
    visible?: boolean;

    @Field({ nullable: true })
    bus_phone?: string;

    @Field({ nullable: true })
    bus_email?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    banner: string;

    @Field(() => [String], { nullable: true })
    photo_showcase: string[];

    @Field(() => [String], { nullable: true })
    video_showcase: string[];

    @Field({ nullable: true })
    pricing?: string;

    @Field({ nullable: true })
    website?: string;

    @Field({ nullable: true })
    instagram?: string;

    @Field({ nullable: true })
    facebook?: string;

    @Field({ nullable: true })
    x?: string;

    @Field({ nullable: true })
    tiktok?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    city?: string;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    latitude?: number;

    @Field({ nullable: true })
    longitude?: number;
}
