import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateServiceInput {

    @Field()
    vendor_id: string;

    @Field()
    name: string;

    @Field()
    category: string;

    @Field({ nullable: true })
    city?: string;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    latitude?: number;

    @Field({ nullable: true })
    longitude?: number;
}
