import {
    Entity,
    Column,
    BeforeInsert,
    BeforeUpdate,
    AfterLoad,
    AfterUpdate,
} from 'typeorm'
import { IsLowercase, Length, MinLength } from 'class-validator'

import { BaseEntity } from '../Entity'
import { decrypt } from '../../utils/encrypt'
import { validateUserBeforeInsert, validateUserBeforeUpdate } from './functions'

export const passwordRegex = new RegExp(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/,
    'i'
)
export const passwordValidationMessage =
    'A valid password consists of atleast 1 uppercase letter, 1 special character, 1 number, and is between 8 - 30 characters long.'
export const userIdRegex = new RegExp(
    /^((?=.*[a-zA-Z])(?=.*[a-zA-Z0-9])([a-zA-Z0-9]){32})/,
    'i'
)
@Entity('users')
export class UserEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    @IsLowercase()
    @Length(3, 255)
    userName: string | undefined

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    @IsLowercase()
    @Length(5, 255)
    email: string | undefined

    @Column({ type: 'varchar', length: 255, nullable: false })
    @MinLength(8)
    password: string | undefined

    @Column({ type: 'tinyint', width: 1, nullable: false, default: 0 })
    public isConfirmed: boolean | number | undefined

    @BeforeInsert()
    async handleBeforeInsert() {
        const validatedUser = await validateUserBeforeInsert(this)
        Object.assign(this, validatedUser)
    }

    @BeforeUpdate()
    async handleBeforeUpdate() {
        const validatedUser = await validateUserBeforeUpdate(this)
        Object.assign(this, validatedUser)
    }

    @AfterLoad()
    @AfterUpdate()
    handleAfterLoad() {
        if (this.email && this.email.indexOf('@') === -1) {
            this.email = decrypt(this.email)
        }
    }
}
