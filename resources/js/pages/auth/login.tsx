import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, LogIn } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {/* <PasskeyVerify /> */}

            {status && (
                <div
                    role="status"
                    className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#00B894]/25 bg-[#00B894]/8 px-4 py-3 text-sm font-medium text-[#00B894]"
                >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-semibold text-[#2D3436]">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="h-11 rounded-xl focus-visible:border-[#6C5CE7] focus-visible:ring-[#6C5CE7]/25"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="font-semibold text-[#2D3436]"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-medium text-[#6C5CE7] hover:text-[#5B4BD4]"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="h-11 rounded-xl focus-visible:border-[#6C5CE7] focus-visible:ring-[#6C5CE7]/25"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="data-[state=checked]:border-[#6C5CE7] data-[state=checked]:bg-[#6C5CE7]"
                                />
                                <Label htmlFor="remember" className="text-[#2D3436]/75">
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-[#6C5CE7] text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:bg-[#5B4BD4] hover:shadow-xl hover:shadow-[#6C5CE7]/35"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <LogIn className="h-4 w-4" aria-hidden="true" />
                                )}
                                Log in
                            </Button>
                        </div>

                        <div className="border-t border-[#2D3436]/6 pt-5 text-center text-sm text-[#2D3436]/60">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-[#6C5CE7] hover:text-[#5B4BD4]"
                            >
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Log in to manage your events, tickets, and bookings.',
};
