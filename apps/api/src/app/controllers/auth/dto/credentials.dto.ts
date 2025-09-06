import { IsString, MaxLength } from 'class-validator';
export class CredentialsDto {
  @IsString()
  @MaxLength(100)
  public readonly username!: string;
  
  @IsString()
  @MaxLength(50)
  public readonly password!: string;
}