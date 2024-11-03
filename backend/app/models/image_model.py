from pydantic import BaseModel, Field, ConfigDict, GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic_core import core_schema
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: type[Any], handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.with_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v: Any, info: core_schema.ValidationInfo):
        if isinstance(v, ObjectId):
            return v
        elif isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
            else:
                raise ValueError(f"Invalid ObjectId: {v}")
        elif isinstance(v, bytes):
            return ObjectId(v)
        else:
            raise TypeError(f"Expected ObjectId, str, or bytes, got {type(v)}")

    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> dict:
        json_schema = handler(schema)
        json_schema.update(type="string")
        return json_schema

class ImageModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[str] = None # TODO: Add user_id
    image_url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )
