import { CheckboxFieldFormElement } from "@/components/fields/CheckboxField";
import { DateFieldFormElement } from "@/components/fields/DateField";
import { NumberFieldFormElement } from "@/components/fields/NumberField";
import { ParagraphFieldFormElement } from "@/components/fields/ParagraphField";
import { SelectFieldFormElement } from "@/components/fields/SelectField";
import { SeparatorFieldFormElement } from "@/components/fields/SeparatorField";
import { SpacerFieldFormElement } from "@/components/fields/SpacerField";
import { SubTitleFieldFormElement } from "@/components/fields/SubTitleField";
import { TextAreaFormElement } from "@/components/fields/TextAreaField";
import { TextFieldFormElement } from "@/components/fields/TextField";
import { TitleFieldFormElement } from "@/components/fields/TitleField";
import { TelephoneFieldFormElement } from "@/components/fields/TelephoneField";
import { Dispatch, SetStateAction } from "react";

export interface Role {
  id: number;
  name: string;

  users?: User[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name?: string;
  business_id?: number;
  business_name?: string;
  last_login_at?: string;
  is_active: boolean;
  onboarded: boolean;

  sent_messages?: Message[];
  received_messages?: MessageRecipient[];
  tasks?: Task[];
  chats?: Chat[];
  ai_characters?: UserAICharacter[];
}

export interface Business {
  id: number;
  name: string;
  domain?: string;
  subscription_plan_id?: number;
  subscription_plan_name?: string;
  description?: string;
  phone?: string;
  url_linkedin?: string;
  url_instagram?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_tiktok?: string;
  url_youtube?: string;
  seo_description?: string;
  business_email?: string;
  profile_image_url?: string;
  background_image_url?: string;

  users?: User[];
  forms?: Form[];
  tasks?: Task[];
  ai_characters?: AICharacter[];
  landing_pages?: LandingPage[];
  social_media_posts?: SocialMediaPost[];
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
  fields: FormField[];
  shareUrl: string;
  businessId: number;
  business_name?: string;
  description?: string;
  extraAttributes?: Record<string, any>;
  createdAt: string;
  published: boolean;
  visits: number;
  submissionsCount?: number;

  landing_page_id?: number;
  landing_page_url?: string;
  FormSubmissions?: Submission[];
}

export interface Submission {
  id: number;
  formId: number;
  form_name?: string;
  user_id: number;
  username?: string;
  formUrl: string;
  content?: Record<string, any>;
  createdAt: string;
}

export interface LandingPage {
  id: number;
  url: string;
  content?: string;
  business_id: number;

  forms?: Form[];
}

export interface SocialMediaPost {
  id: number;
  content: string;
  image_url?: string;
  posted_at: string;
  platform: string;
  metrics?: Record<string, any>;
  business_id: number;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  assigned_to_id?: number;
  assigned_to_username?: string;
  ai_character_id?: number;
  ai_character_name?: string;
  business_id: number;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AICharacter {
  id: number;
  name: string;
  business_id: number;

  tasks?: Task[];
  users?: UserAICharacter[];
}

export interface Chat {
  id: number;
  user_id: number;
  message: string;
  ai_response?: string;
  timestamp: string;
  chat_type: string;

  user?: User;
}

export interface Message {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;

  sender?: User;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  message_id: number;
  user_id: number;
  read: boolean;
  read_at?: string;

  user?: User;
  message?: Message;
}

export interface UserAICharacter {
  user_id: number;
  ai_character_id: number;
  permissions: string;

  user?: User;
  ai_character?: AICharacter;
}

export interface FormField {
  id: string;
  type: ElementsType;
  label?: string;
  required?: boolean;
  extraAttributes: {
    label?: string;
    required?: boolean;
    placeHolder?: string;
    helperText?: string;
    options?: { label: string; value: string }[];
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
  | "CheckboxField";

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
};

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
    messages?: Message[];
    chats?: Chat[];
    aiCharacters?: AICharacter[];
    landingPages?: LandingPage[];
    socialMediaPosts?: SocialMediaPost[];
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
    };
    createBusiness: (businessData: any) => Promise<boolean>;
    fetchSubmissions: (shareUrl: string, businessId: number) => Promise<void>;
    fetchAllSubmissions: (page?: number) => Promise<Submission[] | null>;
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
    fetchFormByShareUrl: (
      shareUrl: string,
      businessId: number
    ) => Promise<Form | null>;
    fetchFormByShareUrlPublic: (
      shareUrl: string,
      businessId: number
    ) => Promise<Form | null>;
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
  posted_at: string;
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
  subscription_plan_id?: number;
  subscription_plan_name?: string;
  description?: string;
  phone?: string;
  url_linkedin?: string;
  url_instagram?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_tiktok?: string;
  url_youtube?: string;
  seo_description?: string;
  business_email?: string;
  profile_image_url?: string;
  background_image_url?: string;
  users?: User[];
  forms?: Form[];
  tasks?: Task[];
  ai_characters?: AICharacter[];
  landing_pages?: LandingPage[];
  social_media_posts?: SocialMediaPost[];
}
