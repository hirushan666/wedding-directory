import { gql } from "@apollo/client";

export const CREATE_VENDOR = gql`
  mutation CreateVendor($input: CreateVendorInput!) {
    createVendor(input: $input) {
      id
      email
      fname
      lname
      busname
      phone
      city
      location
    }
  }
`;

export const CREATE_VISITOR_MUTATION = gql`
  mutation CreateVisitor($email: String!, $password: String!) {
    createVisitor(createVisitorInput: { email: $email, password: $password }) {
      id
      email
    }
  }
`;

export const UPDATE_VISITOR = gql`
  mutation UpdateVisitor($id: String!, $input: UpdateVisitorInput!) {
    updateVisitor(id: $id, input: $input) {
      id
      visitor_fname
      visitor_lname
      partner_fname
      partner_lname
      engaged_date
      wed_date
      wed_venue
      phone
      city
    }
  }
`;

export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      category
      city
      location
      latitude
      longitude
      vendor {
        id
      }
    }
  }
`;

export const UPDATE_VENDOR = gql`
  mutation UpdateVendor($id: String!, $input: UpdateVendorInput!) {
    updateVendor(id: $id, input: $input) {
      fname
      lname
      busname
      about
      phone
      city
      location
      email
      password
      profile_pic_url
    }
  }
`;

export const UPDATE_VENDOR_PROFILE_PIC = gql`
  mutation UpdateVendorProfilePic($id: String!, $fileUrl: String!) {
    updateVendorProfilePic(id: $id, fileUrl: $fileUrl) {
      id
      profile_pic_url
    }
  }
`;

export const UPDATE_SERVICE_PROFILE = gql`
  mutation UpdateService($id: String!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      category
      description
      pricing
      visible
      city
      location
      latitude
      longitude
    }
  }
`;

export const UPDATE_SERVICE_SOCIALS = gql`
  mutation UpdateService($id: String!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      website
      facebook
      instagram
      tiktok
      x
    }
  }
`;

export const CREATE_GUESTLIST = gql`
  mutation CreateGuestList($input: CreateGuestListInput!) {
    createGuestList(input: $input) {
      id
      name
      number
      address
      contact
      email
      status
      visitor {
        id
      }
    }
  }
`;

export const UPDATE_GUESTLIST = gql`
  mutation UpdateGuestList($id: String!, $input: UpdateGuestListInput!) {
    updateGuestList(id: $id, input: $input) {
      number
      address
      contact
      email
      status
    }
  }
`;

export const DELETE_GUESTLIST = gql`
  mutation DELETE_GUESTLIST($id: String!) {
    deleteGuestList(id: $id)
  }
`;

export const CREATE_CHECKLIST = gql`
  mutation CreateChecklist($input: CreateChecklistInput!) {
    createChecklist(input: $input) {
      id
      title
      due_date
      category
      completed
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CHECKLIST = gql`
  mutation UpdateChecklist($input: UpdateChecklistInput!) {
    updateChecklist(input: $input) {
      id
      title
      due_date
      category
      completed
      notes
      updatedAt
    }
  }
`;

export const DELETE_CHECKLIST = gql`
  mutation DeleteChecklist($id: String!) {
    deleteChecklist(id: $id)
  }
`;

export const CLEAR_ALL_CHECKLISTS = gql`
  mutation ClearAllChecklists($visitorId: String!) {
    clearAllChecklists(visitorId: $visitorId)
  }
`;

export const RESET_DEFAULT_CHECKLIST = gql`
  mutation ResetDefaultChecklist($visitorId: String!) {
    resetDefaultChecklist(visitorId: $visitorId)
  }
`;

export const UPDATE_BUDGET_ITEM = gql`
  mutation UpdateBudgetItem(
    $id: String!
    $updateBudgetItemInput: UpdateBudgetItemInput!
  ) {
    updateBudgetItem(id: $id, updateBudgetItemInput: $updateBudgetItemInput) {
      itemName
      estimatedCost
      amountPaid
      isPaidInFull
      updatedAt
    }
  }
`;

export const CREATE_BUDGET_TOOL = gql`
  mutation CreateBudgetTool($input: CreateBudgetToolInput!) {
    createBudgetTool(createBudgetToolInput: $input) {
      id
    }
  }
`;

export const CREATE_BUDGET_ITEM = gql`
  mutation CreateBudgetItem($input: CreateBudgetItemInput!) {
    createBudgetItem(createBudgetItemInput: $input) {
      id
    }
  }
`;

export const DELETE_BUDGET_ITEM = gql`
  mutation DeleteBudgetItem($id: String!) {
    deleteBudgetItem(id: $id)
  }
`;

export const ADD_TO_MY_VENDORS = gql`
  mutation AddToMyVendors($visitorId: String!, $serviceId: String!) {
    addToMyVendors(visitorId: $visitorId, serviceId: $serviceId) {
      id
      service {
        id
        name
      }
    }
  }
`;

export const REMOVE_FROM_MY_VENDORS = gql`
  mutation RemoveFromMyVendors($visitorId: String!, $serviceId: String!) {
    removeFromMyVendors(visitorId: $visitorId, serviceId: $serviceId) {
      id
      service {
        id
        name
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($visitorId: String!, $serviceId: String!) {
    createChat(
      createChatInput: { visitorId: $visitorId, serviceId: $serviceId }
    ) {
      chatId
      visitorId
      serviceId
      vendorId
      visitor {
        id
      }
      vendor {
        id
      }
      service {
        id
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation sendQuoteMessage(
    $chatId: String!
    $content: String!
    $visitorSenderId: String
    $vendorSenderId: String
  ) {
    sendQuoteMessage(
      chatId: $chatId
      content: $content
      visitorSenderId: $visitorSenderId
      vendorSenderId: $vendorSenderId
    ) {
      chatId
      messages {
        content
        senderId
        senderType
        timestamp
      }
    }
  }
`;

export const MARK_CHAT_AS_READ = gql`
  mutation MarkChatAsRead($chatId: String!, $userId: String!, $userType: String!) {
    markChatAsRead(chatId: $chatId, userId: $userId, userType: $userType)
  }
`;

export const CREATE_PACKAGE = gql`
  mutation CreatePackage($input: CreatePackageInput!, $serviceId: String!) {
    createPackage(input: $input, serviceId: $serviceId) {
      id
      name
      description
      pricing
      features
      visible
      requiresReservation
      requiresApproval
      image
    }
  }
`;

export const UPDATE_PACKAGE = gql`
  mutation UpdatePackage($input: UpdatePackageInput!) {
    updatePackage(input: $input) {
      id
      name
      description
      pricing
      features
      visible
      requiresReservation
      requiresApproval
      image
    }
  }
`;

export const DELETE_PACKAGE = gql`
  mutation DeletePackage($id: String!) {
    deletePackage(id: $id)
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      comment
      rating
      image_urls
      service {
        id
      }
      mentionedService {
        id
        name
        vendor {
          busname
        }
      }
      visitor {
        id
      }
    }
  }
`;

export const SET_WEDDING_DATE = gql`
  mutation SetWeddingDate($visitorId: String!, $weddingDate: DateTime!) {
    setWeddingDate(visitorId: $visitorId, weddingDate: $weddingDate) {
      id
      wed_date
    }
  }
`;

export const SYNC_COMPLETED_PAYMENTS_TO_MY_VENDORS = gql`
  mutation SyncCompletedPaymentsToMyVendors {
    syncCompletedPaymentsToMyVendors
  }
`;

export const CANCEL_PAYMENT = gql`
  mutation CancelPayment($paymentId: String!, $cancelledBy: String!) {
    cancelPayment(paymentId: $paymentId, cancelledBy: $cancelledBy)
  }
`;

export const TRACK_PACKAGE_VIEW = gql`
  mutation TrackPackageView(
    $packageId: String!
    $visitorId: String
    $sessionId: String
    $ipAddress: String
  ) {
    trackPackageView(
      packageId: $packageId
      visitorId: $visitorId
      sessionId: $sessionId
      ipAddress: $ipAddress
    )
  }
`;

export const CREATE_PACKAGE_APPROVAL_REQUEST = gql`
  mutation CreatePackageApprovalRequest($input: CreateApprovalRequestInput!) {
    createPackageApprovalRequest(input: $input) {
      id
      bookingDate
      userNote
      status
      createdAt
    }
  }
`;

export const RESPOND_PACKAGE_APPROVAL_REQUEST = gql`
  mutation RespondPackageApprovalRequest($input: RespondApprovalRequestInput!) {
    respondPackageApprovalRequest(input: $input) {
      id
      status
      vendorMessage
      approvedAt
      expiresAt
      isExpired
      secondsRemaining
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: String!) {
    deleteService(id: $id)
  }
`;
export const DELETE_OFFERING = DELETE_SERVICE;
