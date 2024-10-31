import { CheckboxFieldFormElement } from "@/components/builder/fields/CheckboxField";
import { DateFieldFormElement } from "@/components/builder/fields/DateField";
import { NumberFieldFormElement } from "@/components/builder/fields/NumberField";
import { ParagraphFieldFormElement } from "@/components/builder/fields/ParagraphField";
import { SelectFieldFormElement } from "@/components/builder/fields/SelectField";
import { SeparatorFieldFormElement } from "@/components/builder/fields/SeparatorField";
import { SpacerFieldFormElement } from "@/components/builder/fields/SpacerField";
import { SubTitleFieldFormElement } from "@/components/builder/fields/SubTitleField";
import { TextAreaFormElement } from "@/components/builder/fields/TextAreaField";
import { TextFieldFormElement } from "@/components/builder/fields/TextField";
import { TitleFieldFormElement } from "@/components/builder/fields/TitleField";
import { TelephoneFieldFormElement } from "@/components/builder/fields/TelephoneField";
import { Dispatch, SetStateAction } from "react";
import { FileUploadFieldFormElement } from "@/components/builder/fields/FileUploadField";

export enum BrandColors {
  BluePrimary = "#151342",
  BlueSecondary = "#242262",
  Purple = "#5100B9",
  LightBlue = "#5252C6",
  NavyBlue = "#223499",
  Cyan = "#00D9EF",
  White = "#FFFFFF",
  Black = "#000000",
}

export interface Role {
  id: number;
  name: string;

  users?: User[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName?: string;
  businessId?: number;
  businessName?: string;
  lastLoginAt?: string;
  isActive: boolean;
  onboarded: boolean;

  sentMessages?: Message[];
  receivedMessages?: MessageRecipient[];
  tasks?: Task[];
  chats?: Chat[];
  aiCharacters?: UserAICharacter[];
}

export interface Business {
  id: number;
  name: string;
  domain?: string;
  subscriptionPlanId?: number;
  subscriptionPlanName?: string;
  description?: string;
  phone?: string;
  url_linkedin?: string;
  url_instagram?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_tiktok?: string;
  url_youtube?: string;
  seo_description?: string;
  businessEmail?: string;
  profileImageUrl?: string;
  backgroundImageUrl?: string;

  users?: User[];
  forms?: Form[];
  tasks?: Task[];
  aiCharacters?: AICharacter[];
  landingPages?: LandingPage[];
  socialMediaPosts?: SocialMediaPost[];
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  features: string[] | null;

  businesses?: Business[];
}

export interface Form {
  id: number;
  name: string;
  fields?: FormField[];
  shareUrl: string;
  businessId: number;
  businessName?: string;
  description?: string;
  extraAttributes?: Record<string, any>;
  createdAt: string;
  published: boolean;
  visits?: number;
  submissionsCount?: number;

  landingPageId?: number;
  landingPageUrl?: string;
  FormSubmissions?: Submission[];
}

export interface Submission {
  id: number;
  formId: number;
  formName?: string;
  userId: number;
  username?: string;
  formUrl: string;
  status: string;
  content?: Record<string, { label: string; value: string | null }>;
  created_at: string;
  fileUrls?: string[];
}

export enum SubmissionStatusEnum {
  PENDING = "PENDING",
  RECEIVED = "RECEIVED",
  PROCESSING = "PROCESSING",
  REVIEWING = "REVIEWING",
  STARTED = "STARTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface LandingPage {
  id: number;
  url: string;
  content?: string;
  businessId: number;

  forms?: Form[];
}

export interface SocialMediaPost {
  id: number;
  content: string;
  imageUrl?: string;
  postedAt: string;
  platform: string;
  metrics?: Record<string, any>;
  businessId: number;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  assignedToId?: number;
  assignedToUsername?: string;
  aiCharacterId?: number;
  aiCharacterName?: string;
  businessId: number;
  status: string;
  priority: string;
  dueCate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AICharacter {
  id: number;
  name: string;
  businessId: number;

  tasks?: Task[];
  users?: UserAICharacter[];
}

export interface Chat {
  id: number;
  userId: number;
  message: string;
  aiResponse?: string;
  timestamp: string;
  chatType: string;

  user?: User;
}

export interface ConversationSummary {
  conversationId: number;
  lastMessage: InboxMessage | null;
  participants: {
    userId: number;
    username: string;
  }[];
}

export interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;

  sender?: User;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  messageId: number;
  userId: number;
  read: boolean;
  readAt?: string;
  readOnly: boolean;
  user?: User;
  message?: Message;
}

export interface InboxMessage {
  messageId: number;
  senderId: number;
  senderUsername: string;
  content: string;
  timestamp: string;
  read: boolean;
  readOnly: boolean;
}

export interface UserAICharacter {
  userId: number;
  aiCharacterId: number;
  permissions: string;

  user?: User;
  aiCharacter?: AICharacter;
}

export interface FormField {
  id: string;
  type: ElementsType;
  label?: string;
  required?: boolean;
  extraAttributes?: {
    label?: string;
    required?: boolean;
    placeHolder?: string;
    helperText?: string;
    options?: Array<{ label: string; value: string }>;
    rows?: number;
    [key: string]: any;
  };
}

export type ElementsType =
  | "TextField"
  | "TitleField"
  | "SubTitleField"
  | "ParagraphField"
  | "SeparatorField"
  | "SpacerField"
  | "NumberField"
  | "TextAreaField"
  | "DateField"
  | "SelectField"
  | "TelephoneField"
  | "CheckboxField"
  | "FileUploadField";

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
  type: ElementsType;

  construct: (id: string) => FormElementInstance;

  designerBtnElement: {
    icon: React.ElementType;
    label: string;
  };

  designerComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;

  formComponent: React.FC<{
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
    handleFileChange?: (fieldId: string, files: File | File[]) => void;
  }>;

  propertiesComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;

  validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};

export type FormElementInstance = FormField;

type FormElementsType = {
  [key in ElementsType]: FormElement;
};
export const FormElements: FormElementsType = {
  TextField: TextFieldFormElement,
  TitleField: TitleFieldFormElement,
  SubTitleField: SubTitleFieldFormElement,
  ParagraphField: ParagraphFieldFormElement,
  SeparatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  NumberField: NumberFieldFormElement,
  TextAreaField: TextAreaFormElement,
  DateField: DateFieldFormElement,
  SelectField: SelectFieldFormElement,
  CheckboxField: CheckboxFieldFormElement,
  TelephoneField: TelephoneFieldFormElement,
  FileUploadField: FileUploadFieldFormElement,
};

export interface UploadResponse {
  message: string;
  filename: string;
  path: string;
}

export interface FetchError {
  message: string;
  code?: number;
}

export interface AppContextType {
  selectors: {
    setFormName: (name: string) => void;
    setElements: (elements: FormField[]) => void;
    setSelectedElement: (element: FormField | null) => void;
    handleFormNameChange: (newName: string) => void;
    setUnsavedChanges: (flag: boolean) => void;
    setSubmissions: (submissions: Submission[]) => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setForms: (forms: Form[] | []) => void;
    setForm: (form: Form | null) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentBusiness: React.Dispatch<React.SetStateAction<Business | null>>;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  };
  data: {
    isExpanded: boolean;
    formName: string;
    elements: FormField[];
    selectedElement: FormField | null;
    unsavedChanges: boolean;
    loading: boolean;
    form: Form | null;
    forms: Form[];
    submissions: Submission[];
    subscriptionPlans: SubscriptionPlan[];
    businesses: Business[];
    business: Business | null;
    error: string | null;
    godMode: boolean;
    currentSection: string;
    users: User[] | null;
    currentUser: User | null;
    currentPage?: number;
    totalPages?: number;
    roles?: Role[];
    tasks?: Task[];
    // messages?: Message[];
    chats?: Chat[];
    aiCharacters?: AICharacter[];
    landingPages?: LandingPage[];
    socialMediaPosts?: SocialMediaPost[];
    messages?: InboxMessage[];
    conversations?: ConversationSummary[];
  };
  actions: {
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    formActions: {
      createForm: (newForm: {
        name: string;
        description: string;
      }) => Promise<{ formId: number; shareUrl: string } | null>;
      saveForm: () => Promise<void>;
      publishForm: (action: "publish" | "unpublish") => Promise<void>;
      addElement: (index: number, element: FormElementInstance) => void;
      removeElement: (id: string) => void;
      updateElement: (id: string, element: FormElementInstance) => void;
      deleteForm: (formId: number) => Promise<void>;
      fetchFormsByBusinessId: (businessId: number) => Promise<void>;
      fetchAllForms: () => Promise<void>;
      fetchFormByShareUrl: (
        shareUrl: string,
        businessId: number
      ) => Promise<Form | null>;
      fetchFormByShareUrlPublic: (
        shareUrl: string,
        businessId: number
      ) => Promise<Form | null>;
      fetchPublishedFormsByBusinessId: (
        businessId: number
      ) => Promise<Form[] | null>;
    };
    createBusiness: (businessData: any) => Promise<boolean>;
    createUser: (userData: any) => Promise<any>;
    fetchSubmissions: (shareUrl: string) => Promise<void>;
    fetchAllSubmissions: (page?: number) => Promise<Submission[] | null>;
    updateSubmissionStatus: (
      submissionId: number,
      newStatus: string
    ) => Promise<void>;
    getFormSubmissionByCaseId: (caseId: string) => Promise<Submission | null>;
    getMissingFields: (submission: Submission, form: Form) => Promise<string[]>;
    fetchClientSubmissions: () => Promise<void>;
    fetchSubscriptionPlans: () => Promise<void>;
    getAllBusinesses: () => Promise<void>;
    getBusinessById: (businessId: number) => Promise<void>;
    editBusiness: (
      businessId: number,
      businessData: Partial<Business>
    ) => Promise<boolean>;
    deleteBusiness: (businessId: number) => Promise<boolean>;
    toggleGodMode: () => void;
    switchSection: (section: string) => void;
    fetchAllUsers: () => Promise<User[] | null>;
    fetchAllRoles?: () => Promise<Role[] | null>;
    fetchAllTasks?: () => Promise<Task[] | null>;
    fetchAllMessages?: () => Promise<Message[] | null>;
    fetchAllChats?: () => Promise<Chat[] | null>;
    fetchAllAICharacters?: () => Promise<AICharacter[] | null>;
    fetchAllLandingPages?: () => Promise<LandingPage[] | null>;
    fetchAllSocialMediaPosts?: () => Promise<SocialMediaPost[] | null>;
    messageActions: {
      fetchConversations: () => Promise<void>;
      fetchMessages: (conversationId: number) => Promise<void>;
      setConversations: React.Dispatch<
        React.SetStateAction<ConversationSummary[]>
      >;
      setMessages: React.Dispatch<React.SetStateAction<InboxMessage[]>>;
      replyToMessage: (messageId: number, content: string) => Promise<void>;
      sendMessageToUsers: (
        recipientIds: number[],
        content: string,
        readOnly: boolean
      ) => Promise<void>;
      sendMessage: (conversationId: number, content: string) => Promise<void>;
      markAsRead: (messageId: number) => Promise<void>;
      fetchInboxMessages: () => Promise<void>;
    };
  };
}

/* ==================================================================================*/
/* ==================================================================================*/

export interface SummaryCard {
  title: string;
  value: string;
  change: string;
  changePercentage: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  customer: Customer;
  type: string;
  status: string;
  date: string;
  amount: string;
}

export interface OrderDetail extends Order {
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    cost: string;
  };
  payment: {
    method: string;
    cardLastFour: string;
  };
}

export interface Task {
  id: number;
  name: string;
  status: string;
}

export interface AICharacter {
  id: number;
  name: string;
}

export interface LandingPage {
  id: number;
  url: string;
  content?: string;
}

export interface SocialMediaPost {
  id: number;
  platform: string;
  postedAt: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  features: string[] | null;
}

export interface Business {
  id: number;
  name: string;
  domain?: string;
  subscriptionPlanId?: number;
  subscriptionPlanName?: string;
  description?: string;
  phone?: string;
  url_linkedin?: string;
  url_instagram?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_tiktok?: string;
  url_youtube?: string;
  seo_description?: string;
  businessEmail?: string;
  profileImageUrl?: string;
  backgroundImageUrl?: string;
  users?: User[];
  forms?: Form[];
  tasks?: Task[];
  aiCharacters?: AICharacter[];
  landingPages?: LandingPage[];
  socialMediaPosts?: SocialMediaPost[];
}
