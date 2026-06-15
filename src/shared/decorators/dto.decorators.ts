import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
  ValidationArguments,
} from 'class-validator';

import { MESSAGES } from '../constants/message.constants';
import { CommonHelpers } from '../helpers/common.helpers';
import { MaxNumberLength } from './max-number-length.decorator';

interface IDtoDecoratorOption {
  optional?: boolean;
}

function initializeDecorators(
  options: IDtoDecoratorOption,
  additionMiddle: (decorators: PropertyDecorator[]) => unknown,
) {
  const ApiPropertyOpts = {} as ApiPropertyOptions;

  if (options?.optional) {
    ApiPropertyOpts.required = false;
  }

  const decorators = [ApiProperty(ApiPropertyOpts)];
  additionMiddle(decorators);

  if (options?.optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(
      IsNotEmpty({
        message: (args: ValidationArguments) =>
          CommonHelpers.formatMessageString(MESSAGES.REQUIRED, args.property),
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function EnumField(entity: object, options?: IDtoDecoratorOption) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) =>
      decorators.push(
        IsEnum(entity, {
          message: (args: ValidationArguments) =>
            CommonHelpers.formatMessageString(
              MESSAGES.REQUIRED_IN_VALUES,
              args.property,
              (args.constraints[1] as (string | number)[]).join(', '),
            ),
        }),
        ApiProperty({ enum: entity }),
      ),
  );
}

export function StringField(
  options?: IDtoDecoratorOption,
  length?: { min: number; max: number },
) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      if (length) {
        decorators.push(
          Length(length.min, length.max, {
            message: (args: ValidationArguments) =>
              CommonHelpers.formatMessageString(
                MESSAGES.REQUIRED_STRING_IN_RANGE,
                args.property,
                args.constraints[0],
                args.constraints[1],
              ),
          }),
        );
      }

      decorators.push(
        IsString({
          message: (args: ValidationArguments) =>
            CommonHelpers.formatMessageString(
              MESSAGES.REQUIRED_STRING,
              args.property,
            ),
        }),
      );
    },
  );
}

export function NumberField(
  options?: IDtoDecoratorOption & { maxLength?: number; min?: number },
) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      if (options?.min) {
        decorators.push(
          Min(options?.min, {
            message: (args: ValidationArguments) =>
              CommonHelpers.formatMessageString(
                MESSAGES.REQUIRED_NUMBER_MIN_VALUE,
                args.property,
                args.constraints[0],
              ),
          }),
        );
      }

      if (options?.maxLength) {
        decorators.push(MaxNumberLength(options?.maxLength));
      }

      decorators.push(
        IsNumber(
          {},
          {
            message: (args: ValidationArguments) =>
              CommonHelpers.formatMessageString(
                MESSAGES.REQUIRED_NUMBER,
                args.property,
              ),
          },
        ),
      );
    },
  );
}

export function EmailField(
  options?: IDtoDecoratorOption,
  length?: { min: number; max: number },
) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      if (length) {
        decorators.push(
          Length(length.min, length.max, {
            message: (args: ValidationArguments) =>
              CommonHelpers.formatMessageString(
                MESSAGES.REQUIRED_STRING_IN_RANGE,
                args.property,
                args.constraints[0],
                args.constraints[1],
              ),
          }),
        );
      }

      decorators.push(
        IsEmail(
          {},
          {
            message: (args: ValidationArguments) =>
              CommonHelpers.formatMessageString(
                MESSAGES.REQUIRED_EMAIL_FORMAT,
                args.property,
              ),
          },
        ),
      );
    },
  );
}

export function IntField(options?: IDtoDecoratorOption) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      const messageCustom = {
        message: (args: ValidationArguments) =>
          CommonHelpers.formatMessageString(
            MESSAGES.REQUIRED_INTEGER,
            args.property,
          ),
      };

      decorators.push(IsInt(messageCustom), Min(1, messageCustom));
    },
  );
}

export function ResField(options?: ApiPropertyOptions) {
  return applyDecorators(ApiProperty(options), Expose());
}

export function DateStringField(options?: IDtoDecoratorOption) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      const messageCustom = {
        message: (args: ValidationArguments) =>
          CommonHelpers.formatMessageString(
            MESSAGES.REQUIRED_DATE_FORMAT,
            args.property,
          ),
      };

      decorators.push(IsDateString({}, messageCustom));
    },
  );
}

export function BooleanField(options?: IDtoDecoratorOption) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      const messageCustom = {
        message: (args: ValidationArguments) =>
          CommonHelpers.formatMessageString(
            MESSAGES.REQUIRED_BOOLEAN,
            args.property,
          ),
      };

      decorators.push(IsBoolean(messageCustom));
    },
  );
}

export function ArrayField(
  entity: new (...args: any[]) => any,
  options?: IDtoDecoratorOption & { minSize?: number },
) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      const messageCustom = {
        message: (args: ValidationArguments) =>
          CommonHelpers.formatMessageString(
            MESSAGES.REQUIRED_ARRAY,
            args.property,
          ),
      };

      decorators.push(
        IsArray(messageCustom),
        ValidateNested({ each: true }),
        Type(() => entity),
        ApiProperty({ type: () => [entity] }),
      );

      if (options?.minSize !== undefined) {
        decorators.push(ArrayMinSize(options.minSize));
      }
    },
  );
}

export function ObjectField(entity: object, options?: IDtoDecoratorOption) {
  return initializeDecorators(
    options as IDtoDecoratorOption,
    (decorators: PropertyDecorator[]) => {
      const messageCustom = {
        message: (args: ValidationArguments) =>
          CommonHelpers.formatMessageString(
            MESSAGES.REQUIRED_OBJECT,
            args.property,
          ),
      };

      decorators.push(
        IsObject(messageCustom),
        ApiProperty({ type: () => entity }),
      );
    },
  );
}
