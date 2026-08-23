import { Form, Head, Link, useForm } from '@inertiajs/react';
import {
    MessageSquareReply,
    PanelTop,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { botSettings } from '@/routes';
import {
    destroy,
    index as threadMenusIndex,
    store,
    update,
} from '@/routes/thread-menus';
import { index as threadResponsesIndex } from '@/routes/thread-responses';

type Thread = {
    id: number;
    title_eng: string;
    title_sw: string;
    step: string;
    flag: string;
    thread_type: string;
    label: string;
    back_status: boolean;
    close_thread: boolean;
    user: { id: number; name: string } | null;
    created_at: string;
};

type Props = {
    threads: Thread[];
    flags: string[];
    threadTypes: string[];
    labels: string[];
};

type FormValues = {
    title_eng: string;
    title_sw: string;
    step: string;
    flag: string;
    thread_type: string;
    label: string;
    back_status: boolean;
    close_thread: boolean;
};

type ThreadForm = ReturnType<typeof useForm<FormValues>>;

function emptyValues(): FormValues {
    return {
        title_eng: '',
        title_sw: '',
        step: '',
        flag: '',
        thread_type: '',
        label: '',
        back_status: false,
        close_thread: false,
    };
}

function ThreadSelectItems({
    options,
    emptyLabel,
}: {
    options: string[];
    emptyLabel: string;
}) {
    if (options.length === 0) {
        return (
            <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyLabel}
            </div>
        );
    }

    return options.map((option) => (
        <SelectItem key={option} value={option}>
            {option}
        </SelectItem>
    ));
}

function ThreadFormFields({
    form,
    flags,
    threadTypes,
    labels,
}: {
    form: ThreadForm;
    flags: string[];
    threadTypes: string[];
    labels: string[];
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title-eng">Title (English)</Label>
                <Textarea
                    id="title-eng"
                    value={form.data.title_eng}
                    onChange={(e) => form.setData('title_eng', e.target.value)}
                    placeholder="e.g. Main Menu"
                    rows={2}
                />
                <InputError message={form.errors.title_eng} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title-sw">Title (Swahili)</Label>
                <Textarea
                    id="title-sw"
                    value={form.data.title_sw}
                    onChange={(e) => form.setData('title_sw', e.target.value)}
                    placeholder="e.g. Menyu Kuu"
                    rows={2}
                />
                <InputError message={form.errors.title_sw} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="step">Step</Label>
                <Input
                    id="step"
                    value={form.data.step}
                    onChange={(e) => form.setData('step', e.target.value)}
                    placeholder="e.g. 1"
                />
                <InputError message={form.errors.step} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="flag">Flag</Label>
                    <Select
                        value={form.data.flag}
                        onValueChange={(value) => form.setData('flag', value)}
                    >
                        <SelectTrigger id="flag">
                            <SelectValue placeholder="Select a flag" />
                        </SelectTrigger>
                        <SelectContent>
                            <ThreadSelectItems
                                options={flags}
                                emptyLabel="No flags available"
                            />
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.flag} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="thread-type">Thread type</Label>
                    <Select
                        value={form.data.thread_type}
                        onValueChange={(value) =>
                            form.setData('thread_type', value)
                        }
                    >
                        <SelectTrigger id="thread-type">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <ThreadSelectItems
                                options={threadTypes}
                                emptyLabel="No thread types available"
                            />
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.thread_type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="label">Label</Label>
                    <Select
                        value={form.data.label}
                        onValueChange={(value) => form.setData('label', value)}
                    >
                        <SelectTrigger id="label">
                            <SelectValue placeholder="Select a label" />
                        </SelectTrigger>
                        <SelectContent>
                            <ThreadSelectItems
                                options={labels}
                                emptyLabel="No labels available"
                            />
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.label} />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                        checked={form.data.back_status}
                        onCheckedChange={(checked) =>
                            form.setData('back_status', checked === true)
                        }
                    />
                    Back status
                </label>
                <InputError message={form.errors.back_status} />
            </div>

            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                        checked={form.data.close_thread}
                        onCheckedChange={(checked) =>
                            form.setData('close_thread', checked === true)
                        }
                    />
                    Close thread
                </label>
                <InputError message={form.errors.close_thread} />
            </div>
        </>
    );
}

function CreateThreadDialog({
    flags,
    threadTypes,
    labels,
}: {
    flags: string[];
    threadTypes: string[];
    labels: string[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<FormValues>(emptyValues());

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button data-test="create-thread-button">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New thread menu
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New thread menu</DialogTitle>
                    <DialogDescription>
                        Create a menu the bot shows to users.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <ThreadFormFields
                        form={form}
                        flags={flags}
                        threadTypes={threadTypes}
                        labels={labels}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditThreadDialog({
    thread,
    flags,
    threadTypes,
    labels,
}: {
    thread: Thread;
    flags: string[];
    threadTypes: string[];
    labels: string[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<FormValues>({
        title_eng: thread.title_eng,
        title_sw: thread.title_sw,
        step: thread.step,
        flag: thread.flag,
        thread_type: thread.thread_type,
        label: thread.label,
        back_status: thread.back_status,
        close_thread: thread.close_thread,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(update(thread.id).url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${thread.title_eng}`}
                >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit thread menu</DialogTitle>
                    <DialogDescription>
                        Update how this thread behaves.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <ThreadFormFields
                        form={form}
                        flags={flags}
                        threadTypes={threadTypes}
                        labels={labels}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteThreadDialog({ thread }: { thread: Thread }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${thread.title_eng}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete thread menu</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {thread.title_eng}
                        </span>
                        ? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...destroy.form(thread.id)}
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing }) => (
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Delete
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function ThreadMenus({
    threads,
    flags,
    threadTypes,
    labels,
}: Props) {
    return (
        <>
            <Head title="Thread Menu" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Thread Menu
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Menus the WhatsApp bot shows to users.
                        </p>
                    </div>
                    <CreateThreadDialog
                        flags={flags}
                        threadTypes={threadTypes}
                        labels={labels}
                    />
                </div>

                {threads.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <PanelTop
                                className="h-6 w-6 text-primary"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="font-medium">No thread menus yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Create your first thread menu and it will appear
                            here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-medium">
                                        Title
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium md:table-cell">
                                        Swahili
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Step
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                        Flag
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                        Type
                                    </th>
                                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                                        Status
                                    </th>
                                    <th className="w-24 px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {threads.map((thread) => (
                                    <tr
                                        key={thread.id}
                                        className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {thread.title_eng}
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                            {thread.title_sw}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary">
                                                Step {thread.step}
                                            </Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 sm:table-cell">
                                            <Badge variant="outline">
                                                {thread.flag}
                                            </Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 sm:table-cell">
                                            {thread.thread_type}
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            {thread.close_thread ? (
                                                <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
                                                    Closed
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                    Open
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {thread.thread_type ===
                                                    'interactive' && (
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Responses for ${thread.title_eng}`}
                                                        title="Responses"
                                                    >
                                                        <Link
                                                            href={threadResponsesIndex(
                                                                {
                                                                    thread: thread.id,
                                                                },
                                                            )}
                                                        >
                                                            <MessageSquareReply
                                                                className="h-4 w-4 text-primary"
                                                                aria-hidden="true"
                                                            />
                                                        </Link>
                                                    </Button>
                                                )}
                                                <EditThreadDialog
                                                    thread={thread}
                                                    flags={flags}
                                                    threadTypes={threadTypes}
                                                    labels={labels}
                                                />
                                                <DeleteThreadDialog
                                                    thread={thread}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

ThreadMenus.layout = {
    breadcrumbs: [
        {
            title: 'Bot Settings',
            href: botSettings(),
        },
        {
            title: 'Thread Menu',
            href: threadMenusIndex(),
        },
    ],
};
