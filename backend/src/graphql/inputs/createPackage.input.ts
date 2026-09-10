import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreatePackageInput {
    @Field()
    name: string;

    @Field()
    description: string;

    @Field()
    pricing: number;

    @Field(() => [String])
    features: string[];

    @Field(() => Boolean, { defaultValue: false })
    visible: boolean;
    
    @Field(() => Boolean, { defaultValue: false })
  requiresReservation: boolean;

    @Field({ nullable: true })
    image?: string;
}
