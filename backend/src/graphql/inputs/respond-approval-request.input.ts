import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

registerEnumType(ApprovalAction, {
  name: 'ApprovalAction',
  description: 'Action to approve or reject a package approval request',
});

@InputType()
export class RespondApprovalRequestInput {
  @Field()
  requestId: string;

  @Field()
  vendorId: string;

  @Field(() => ApprovalAction)
  action: ApprovalAction;

  @Field({ nullable: true })
  vendorMessage?: string;
}
