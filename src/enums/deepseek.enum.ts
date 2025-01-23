export enum DeepSeeKModelsEnum {
  DEEPSEEK_CHAT = "deepseek-chat",
  DEEPSEEK_REASONER = "deepseek-reasoner",
}

export enum DeepSeekFinishReasonEnum {
  /**
   * if the model hit a natural stop point or a provided stop sequence.
   */
  STOP = "stop",
  /**
   * if the maximum number of tokens specified in the request was reached.
   */
  LENGTH = "length",
  /**
   * if content was omitted due to a flag from our content filters.
   */
  CONTENT_FILTER = "content_filter",
  /**
   * if the model called a tool.
   */
  TOOL_CALLS = "tool_calls",
  /**
   * if the request is interrupted due to insufficient resource of the inference system.
   */
  INSUFFICIENT_SYSTEM_RESOURCE = "insufficient_system_resource",
}

export enum DeepSeekObjectEnum {
  CHAT_COMPLETION = "chat.completion",
}

export enum DeepSeekToolCallTypeEnum {
    FUNCTION = "function",
}

export enum DeepSeekToolChoiceMessageRoleResponseEnum {
    ASSISTANT = "assistant",
}

export enum DeepSeekToolMessageRoleRequestEnum {
    SYSTEM = "system",
    USER = "user",
    ASSISTANT = "assistant",
    TOOL = "tool",
}

export enum DeepSeekResponseFormatTypeRequestEnum {
    TEXT = "text",
    JSON_OBJECT = "json_object",
}

export enum DeepSeekToolchoiceRequestEnum {
    NONE = "none",
    AUTO = "auto",
    REQUIRED = "required",
}
