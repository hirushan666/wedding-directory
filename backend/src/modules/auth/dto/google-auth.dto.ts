import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsOptional()
  @IsIn(['visitor', 'vendor'])
  role?: 'visitor' | 'vendor';
}
