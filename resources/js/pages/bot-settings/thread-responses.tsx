import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, MessageSquareReply, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { botSettings } from '@/routes';
import { index as threadMenusIndex } from '@/routes/thread-menus';
import {
    destroy,
    store,
    update,
} from '@/routes/thread-responses';

type Thread = {
    id: number;
    title_eng: string;
    title_sw: string;
    thread_type: string;
};

type Response = {
    id: number;
    name_eng: string;
    name_sw: string;
    order_no: string;
    created_at: string;
};

type Props = {
    thread: Thread;
    responses: Response[];
};

type FormValues = {
    name_eng: string;
    name_sw: string;
    order_no: string;
};

export default function ThreadResponses({ thread, responses }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm<FormValues>({ name_eng: '', name_sw: '', order_no: '' });

    const startCreate = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    const startEdit = (response: Response) => {
        setEditingId(response.id);
        form.setData({
            name_eng: response.name_eng,
            name_sw: response.name_sw,
            order_no: response.order_no,
        });
        form.clearErrors();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (editingId === null) {
                    form.reset();
                }
            },
        };

        if (editingId !== null) {
            form.put(update({ thread: thread.id, response: editingId }).url, options);
        } else {
            form.post(store(thread.id).url, options);
        }
    };

    const remove = (response: Response) => {
        if (window.confirm(`Delete response "${response.name_eng}"?`)) {
            router.delete(
                destroy.url({ thread: thread.id, response: response.id }),
                { preserveScroll: true },
            );
        }
    };

    return (
        <>
            <Head title="Thread Response" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <Link
                        href={threadMenusIndex()}
                        className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to thread menus
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Thread Response
                        </h1>
                        <Badge variant="secondary" className="max-w-full truncate">
                            {thread.title_eng}
                        </Badge>
                        <Badge variant="outline">{thread.thread_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Add and edit the responses shown in this list thread menu.
                    </p>
                </div>

                <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
                    <div className="rounded-xl border p-5 lg:sticky lg:top-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                {editingId !== null ? (
                                    <>
                                        <Pencil className="h-4 w-4 text-primary" aria-hidden="true" />
                                        Edit response
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
                                        New response
                                    </>
                                )}
                            </h2>
                            {editingId !== null && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={startCreate}
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                    Cancel
                                </Button>
                            )}
                        </div>

                        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                            <div className="grid gap-2">
                                <Label htmlFor="name-eng">Name (English)</Label>
                                <Input
                                    id="name-eng"
                                    value={form.data.name_eng}
                                    onChange={(e) => form.setData('name_eng', e.target.value)}
                                    placeholder="e.g. Buy tickets"
                                />
                                <InputError message={form.errors.name_eng} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name-sw">Name (Swahili)</Label>
                                <Input
                                    id="name-sw"
                                    value={form.data.name_sw}
                                    onChange={(e) => form.setData('name_sw', e.target.value)}
                                    placeholder="e.g. Nunua tiketi"
                                />
                                <InputError message={form.errors.name_sw} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="order-no">Order</Label>
                                <Input
                                    id="order-no"
                                    type="number"
                                    min="1"
                                    value={form.data.order_no}
                                    onChange={(e) => form.setData('order_no', e.target.value)}
                                    placeholder="e.g. 1"
                                />
                                <InputError message={form.errors.order_no} />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <Spinner />
                                ) : editingId !== null ? (
                                    <Save className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                )}
                                {editingId !== null ? 'Save changes' : 'Add response'}
                            </Button>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-xl border">
                        {responses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <MessageSquareReply
                                        className="h-6 w-6 text-primary"
                                        aria-hidden="true"
                                    />
                                </span>
                                <p className="font-medium">No responses yet</p>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    Add your first response using the form to the left.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left">
                                        <th className="px-4 py-3 font-medium">Order</th>
                                        <th className="px-4 py-3 font-medium">English</th>
                                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                            Swahili
                                        </th>
                                        <th className="hidden px-4 py-3 font-medium md:table-cell">
                                            Created
                                        </th>
                                        <th className="w-24 px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map((response) => (
                                        <tr
                                            key={response.id}
                                            className={`border-b transition-colors last:border-b-0 hover:bg-muted/30 ${
                                                editingId === response.id
                                                    ? 'bg-primary/5'
                                                    : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">
                                                    {response.order_no}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {response.name_eng}
                                            </td>
                                            <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                                {response.name_sw}
                                            </td>
                                            <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                {new Date(
                                                    response.created_at,
                                                ).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit ${response.name_eng}`}
                                                        onClick={() => startEdit(response)}
                                                    >
                                                        <Pencil className="h-4 w-4" aria-hidden="true" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Delete ${response.name_eng}`}
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => remove(response)}
                                                    >
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ThreadResponses.layout = {
    breadcrumbs: [
        {
            title: 'Bot Settings',
            href: botSettings(),
        },
        {
            title: 'Thread Menu',
            href: threadMenusIndex(),
        },
        {
            title: 'Thread Response',
            href: threadMenusIndex(),
        },
    ],
};
