import { gql } from "@apollo/client";

export const GET_ALL_VISITORS = gql`
  query findAllVisitors {
    findAllVisitors {
      id
      email
      visitor_fname
      visitor_lname
      partner_fname
      partner_lname
      wed_venue
      createdAt
    }
  }
`;

export const AUTOCOMPLETE_QUERY = gql`
  query Autocomplete($input: String!) {
    autocompleteLocation(input: $input)
  }
`;

export const FIND_SERVICES = gql`
    query GetFilteredServices($filter: ServiceFilterInput) {
        findServices(filter: $filter) {
            id
            name
            category
            visible
            bus_phone
            bus_email
            description
            banner
            city
            location
            latitude
            longitude
            reviews {
                rating
            }
            vendor {
                id
                busname
                city
                phone
            }
        }
    }
`;

export const FIND_SERVICE_BY_ID = gql`
  query FindServiceById($id: String!) {
    findServiceById(id: $id) {
      id
      name
      category
      description
      bus_phone
      bus_email
      banner
      visible
      website
      facebook
      instagram
      x
      tiktok
      photo_showcase
      video_showcase
      city
      location
      latitude
      longitude
      vendor {
        id
        busname
        city
        about
      }
    }
  }
`;

export const FIND_PORTFOLIO_BY_ID = gql`
  query FindPortfolioById($id: String!) {
    findServiceById(id: $id) {
      id
      banner
      photo_showcase
      video_showcase
    }
  }
`;

export const DELETE_SHOWCASE_IMAGE = gql`
  mutation DeletePhotoShowcase($id: String!, $index: Int!) {
    deleteServiceShowcaseImage(id: $id, index: $index)
  }
`;

export const DELETE_BANNER_IMAGE = gql`
  mutation DeleteBannerImage($id: String!) {
    deleteServiceBanner(id: $id)
  }
`;

export const DELETE_SHOWCASE_VIDEO = gql`
  mutation DeleteVideoShowcase($id: String!) {  
    deleteServiceVideo(id: $id)
  }
`;

export const FIND_SERVICES_BY_VENDOR = gql`
  query FindServicesByVendor($id: String!) {
    findServicesByVendor(id: $id) {
      id
      name
      category
      description
      banner
      city
      location
      latitude
      longitude
      reviews{
        rating
      }
      vendor {
        id
        busname
        city
      }
    }
  }
`;

export const GET_VISITOR_BY_ID = gql`
  query GetVisitorById($id: String!) {
    findVisitorById(id: $id) {
      id
      email
      visitor_fname
      visitor_lname
      partner_fname
      partner_lname
      engaged_date
      wed_date
      wed_venue
      phone
      city
      profile_pic_url
      isOnboarded
    }
  }
`;

export const GET_VENDOR_BY_ID = gql`
  query GetVendorById($id: String!) {
    findVendorById(id: $id) {
      id
      email
      fname
      lname
      busname
      about
      phone
      city
      location
      profile_pic_url
      createdAt
    }
  }
`;

export const FIND_GUESTLIST_BY_VISITOR = gql`
  query FindGuestListsByVisitor($id: String!) {
    findGuestListsByVisitor(id: $id) {
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

export const GET_BUDGET_TOOL = gql`
  query GetBudgetTool($visitorId: String!) {
    budgetTool(visitorId: $visitorId) {
      id
      totalBudget
      budgetItems {
        id
        itemName
        estimatedCost
        amountPaid
        category
        specialNotes
        isPaidInFull
      }
    }
    visitorPayments(visitorId: $visitorId) {
      id
      amount
      createdAt
      status
      package {
        name
        pricing
        service {
          name
          category
        }
      }
    }
  }
`;

export const GET_BUDGET_ITEMS = gql`
  query GetBudgetItems($budgetToolId: String!) {
    budgetItems(budgetToolId: $budgetToolId) {
      id
      itemName
      category
      estimatedCost
      amountPaid
      specialNotes
      isPaidInFull
      createdAt
      updatedAt
    }
  }
`;

export const GET_VISITOR_CHECKLISTS = gql`
  query GetVisitorChecklists($visitorId: String!) {
    getVisitorChecklists(visitorId: $visitorId) {
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

export const FIND_ALL_MY_VENDORS_BY_CATEGORY = gql`
  query FindAllMyVendorsByCategory($visitorId: String!, $category: String!) {
    findAllMyVendorsByCategory(visitorId: $visitorId, category: $category) {
      id
      service {
        id
        name
        category
        vendor {
          busname
          city
        }
        banner
      }
    }
  }
`;

export const FIND_ALL_MY_VENDORS = gql`
  query FindAllMyVendors($visitorId: String!) {
    findAllMyVendors(visitorId: $visitorId) {
      id
      service {
        id
        name
        category
        vendor {
          busname
          city
        }
        banner
      }
    }
  }
`;

export const FIND_MY_VENDOR_BY_ID = gql`
  query FindMyVendorById($visitorId: String!, $serviceId: String!) {
    findMyVendorById(visitorId: $visitorId, serviceId: $serviceId) {
      id
      service {
        id
        name
      }
    }
  }
`;

export const FIND_PACKAGES_BY_SERVICE = gql`
  query FindPackagesByService($serviceId: String!) {
    findPackagesByService(serviceId: $serviceId) {
      id
      name
      description
      pricing
      features
      visible
      requiresReservation
      requiresApproval
      bookedDates
      image
    }
  }
`;
export const FIND_PACKAGES_BY_OFFERING = FIND_PACKAGES_BY_SERVICE;

export const FIND_REVIEW_BY_SERVICE = gql`
  query FindReviewsByService($service_id: String!) {
    findReviewsByService(service_id: $service_id) {
      id
      comment
      rating
      image_urls
      createdAt
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
        visitor_fname
      }
    }
  }
`;

export const FIND_REVIEW_PAGE_BY_SERVICE = gql`
  query FindReviewsByServicePaginated($service_id: String!, $page: Int, $limit: Int) {
    findReviewsByServicePaginated(service_id: $service_id, page: $page, limit: $limit) {
      averageRating
      totalReviews
      currentPage
      pageSize
      totalPages
      reviews {
        id
        comment
        rating
        image_urls
        createdAt
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
          visitor_fname
        }
      }
    }
  }
`;

export const FIND_SERVICE_REVIEW_SUMMARY = gql`
  query FindServiceReviewSummary($service_id: String!) {
    findServiceReviewSummary(service_id: $service_id) {
      id
      serviceId
      summaryText
      reviewCount
      lastReviewAt
      createdAt
      updatedAt
    }
  }
`;

export const FIND_ALL_REVIEWS = gql`
  query FindAllReviews {
    findAllReviews {
      id
      comment
      rating
      image_urls
      createdAt
      service {
        id
        name
        vendor {
          busname
        }
      }
      mentionedService {
        id
        name
        vendor {
          busname
        }
      }
      visitor {
        visitor_fname
      }
    }
  }
`;

export const GET_CHAT = gql`
  query GetChat($visitorId: String!, $serviceId: String!) {
    getChat(visitorId: $visitorId, serviceId: $serviceId) {
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
      messages {
        id
        content
        senderId
        senderType
        timestamp
      }
    }
  }
`;

export const GET_CHAT_HISTORY = gql`
  query GetChatHistory($chatId: String!) {
    getChatHistory(chatId: $chatId) {
      chatId
      serviceId
      vendorId
      visitorId
      messages {
        content
        senderId
        senderType
        timestamp
      }
    }
  }
`;

export const GET_VISITOR_CHATS = gql`
  query GetVisitorChats($visitorId: String!) {
    getVisitorChats(visitorId: $visitorId) {
      chatId
      serviceId
      vendorId
      messages {
        content
        senderId
        senderType
        timestamp
      }
    }
  }
`;

export const GET_VENDOR_DETAILS = gql`
  query GetVendorById($id: String!) {
    findVendorById(id: $id) {
      id
      busname
      city
    }
  }
`;

export const GET_VENDOR_MESSAGES = gql`
  query GetVendorChats($vendorId: String!) {
    getVendorChats(vendorId: $vendorId) {
      chatId
      visitorId
      serviceId
      messages {
        content
        senderId
        senderType
        timestamp
      }
    }
  }
`;

export const GET_SERVICE_DETAILS = gql`
  query GetServiceDetails($id: String!) {
    findServiceById(id: $id) {
      id
      name
      category
      vendor {
        id
        busname
        city
        profile_pic_url
      }
    }
  }
`;
export const GET_OFFERING_DETAILS = GET_SERVICE_DETAILS;

export const GET_VENDOR_CHAT = gql`
  query GetChatHistory($chatId: String!) {
    getChatHistory(chatId: $chatId) {
      messages {
        content
        senderId
        senderType
        timestamp
      }
      visitorId
    }
  }
`;

export const GET_UNREAD_MESSAGE_COUNT = gql`
  query GetUnreadMessageCount($userId: String!, $userType: String!) {
    getUnreadMessageCount(userId: $userId, userType: $userType)
  }
`;

export const GET_CHAT_VISITOR_DETAILS = gql`
  query FindVisitorById($id: String!) {
    findVisitorById(id: $id) {
      id
      email
      visitor_fname
      partner_fname
    }
  }
`;

export const GET_VENDOR_OFFERING_DETAILS = gql`
  query GetVendorOfferingDetails($vendorId: String!) {
    getVendorOfferingDetails(vendorId: $vendorId) {
      id
      name
      category
      bus_phone
      bus_email
    }
  }
`;

export const FIND_VENDOR_BY_SERVICE = gql`
  query FindVendorsByService($service_id: String!) {
    findVendorsByService(service_id: $service_id) {
      location
    }
  }
`;

export const GET_VENDOR_PAYMENTS = gql`
  query GetVendorPayments($vendorId: String!) {
    vendorPayments(vendorId: $vendorId) {
      id
      amount
      status
      createdAt
      bookingDate
      paymentReference
      gateway
      gatewayPaymentId
      visitor {
        id
        visitor_fname
        visitor_lname
        partner_fname
        email
        phone
      }
      package {
        id
        name
        service {
          id
          name
        }
      }
    }
  }
`;

export const GET_VISITOR_PAYMENTS = gql`
  query GetVisitorPayments($visitorId: String!) {
    visitorPayments(visitorId: $visitorId) {
      id
      amount
      status
      createdAt
      bookingDate
      paymentReference
      gateway
      gatewayPaymentId
      vendor {
        id
        busname
        fname
        lname
        city
      }
      package {
        id
        name
        service {
          id
          name
          category
          banner
        }
      }
    }
  }
`;

export const GET_VENDOR_BOOKED_DATES = gql`
  query GetVendorBookedDates($vendorId: String!) {
    getVendorBookedDates(vendorId: $vendorId)
  }
`;

export const GET_PACKAGE_ANALYTICS = gql`
  query GetPackageAnalytics($packageId: String!) {
    getPackageAnalytics(packageId: $packageId) {
      totalUniqueViews
      monthlyViews {
        month
        views
      }
    }
  }
`;

export const GET_VENDOR_ANALYTICS = gql`
  query GetVendorAnalytics($vendorId: String!) {
    getVendorAnalytics(vendorId: $vendorId) {
      totalUniqueViews
      packagesAnalytics {
        packageId
        packageName
        uniqueViews
      }
      monthlyViews {
        month
        views
      }
    }
  }
`;

export const GET_VISITOR_BOOKINGS = gql`
  query GetVisitorBookings($visitorId: String!) {
    getVisitorBookings(visitorId: $visitorId) {
      id
      title
      date
      time
      status
      location
      serviceProvider {
        id
        name
        email
        phone
      }
      packageName
      serviceName
      amount
      createdAt
    }
  }
`;

export const GET_VENDOR_APPROVAL_REQUESTS = gql`
  query GetVendorApprovalRequests($vendorId: String!) {
    getVendorApprovalRequests(vendorId: $vendorId) {
      id
      bookingDate
      userNote
      status
      vendorMessage
      approvedAt
      expiresAt
      isExpired
      secondsRemaining
      createdAt
      updatedAt
      visitor {
        id
        email
        visitor_fname
        visitor_lname
        partner_fname
        phone
        profile_pic_url
      }
      package {
        id
        name
        pricing
        service {
          id
          name
        }
      }
    }
  }
`;

export const GET_VISITOR_APPROVAL_REQUESTS = gql`
  query GetVisitorApprovalRequests($visitorId: String!) {
    getVisitorApprovalRequests(visitorId: $visitorId) {
      id
      bookingDate
      userNote
      status
      vendorMessage
      approvedAt
      expiresAt
      isExpired
      secondsRemaining
      createdAt
      updatedAt
      package {
        id
        name
        pricing
        service {
          id
          name
          vendor {
            id
            busname
            phone
            email
          }
        }
      }
    }
  }
`;

export const GET_PACKAGE_APPROVAL_REQUEST_STATUS = gql`
  query GetPackageApprovalRequestStatus($visitorId: String!, $packageId: String!) {
    getPackageApprovalRequestStatus(visitorId: $visitorId, packageId: $packageId) {
      id
      bookingDate
      userNote
      status
      vendorMessage
      approvedAt
      expiresAt
      isExpired
      secondsRemaining
      createdAt
    }
  }
`;

export const CHECK_REVIEW_ELIGIBILITY = gql`
  query CheckReviewEligibility($service_id: String!, $visitor_id: String) {
    checkReviewEligibility(service_id: $service_id, visitor_id: $visitor_id) {
      canReview
      reason
      message
      bookingDate
    }
  }
`;
