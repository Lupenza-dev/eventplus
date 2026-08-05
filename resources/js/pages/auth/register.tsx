import { Form, Head } from '@inertiajs/react';
import { Building2, LockKeyhole, UserRound, UserRoundPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

function FormSection({
    icon: Icon,
    title,
    children,
}: {
    icon: LucideIcon;
    title: string;
    children: ReactNode;
}) {
    return (
        <fieldset className="grid gap-4">
            <legend className="mb-4 flex w-full items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C5CE7]/10">
                    <Icon className="h-4 w-4 text-[#6C5CE7]" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold tracking-wide text-[#2D3436] uppercase">
                    {title}
                </span>
                <span className="h-px flex-1 bg-[#2D3436]/8" aria-hidden="true" />
            </legend>
            {children}
        </fieldset>
    );
}

const inputClasses =
    'h-11 rounded-xl focus-visible:border-[#6C5CE7] focus-visible:ring-[#6C5CE7]/25';
const labelClasses = 'font-semibold text-[#2D3436]';

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-8">
                            <FormSection icon={Building2} title="Business information">
                                <div className="grid gap-2">
                                    <Label htmlFor="business_name" className={labelClasses}>
                                        Business name
                                    </Label>
                                    <Input
                                        id="business_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="organization"
                                        name="business_name"
                                        placeholder="e.g. Kilimanjaro Events Ltd"
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.business_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="business_address" className={labelClasses}>
                                        Business address
                                    </Label>
                                    <Input
                                        id="business_address"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="street-address"
                                        name="business_address"
                                        placeholder="Street, city, country"
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.business_address} />
                                </div>
                            </FormSection>

                            <FormSection icon={UserRound} title="Contact person">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className={labelClasses}>
                                        Full name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        tabIndex={3}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Full name"
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className={labelClasses}>
                                            Phone number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            required
                                            tabIndex={4}
                                            autoComplete="tel"
                                            name="phone"
                                            placeholder="+255 700 000 000"
                                            className={inputClasses}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className={labelClasses}>
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={5}
                                            autoComplete="email"
                                            name="email"
                                            placeholder="email@example.com"
                                            className={inputClasses}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                            </FormSection>

                            <FormSection icon={LockKeyhole} title="Security">
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className={labelClasses}>
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={6}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        passwordrules={passwordRules}
                                        className={inputClasses}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className={labelClasses}
                                    >
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={7}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Re-enter your password"
                                        passwordrules={passwordRules}
                                        className={inputClasses}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </FormSection>

                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl bg-[#6C5CE7] text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:bg-[#5B4BD4] hover:shadow-xl hover:shadow-[#6C5CE7]/35"
                                tabIndex={8}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
                                )}
                                Create account
                            </Button>
                        </div>

                        <div className="border-t border-[#2D3436]/6 pt-5 text-center text-sm text-[#2D3436]/60">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={9}
                                className="font-semibold text-[#6C5CE7] hover:text-[#5B4BD4]"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create your business account',
    description:
        'Tell us about your business and the person we should contact.',
    wide: true,
};
