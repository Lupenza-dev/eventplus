import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    GitBranch,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { botSettings } from '@/routes';
import {
    destroy,
    index as threadLinksIndex,
    store,
    update,
} from '@/routes/thread-links';
import { index as threadMenusIndex } from '@/routes/thread-menus';

type Thread = {
    id: number;
    title_eng: string;
    title_sw: string;
    step:string
};

type Link = {
    id: number;
    thread_id: number;
    linked_thread_id: number;
    thread: Thread;
    linked_thread: Thread;
    created_at: string;
};

type Props = {
    links: Link[];
    threads: Thread[];
};

type FormValues = {
    thread_id: string;
    linked_thread_id: string;
};

export default function ThreadLinks({ links, threads }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm<FormValues>({ thread_id: '', linked_thread_id: '' });

    const selectableThreads = useMemo(() => {
        if (editingId === null) {
            return threads;
        }

        const current = links.find((link) => link.id === editingId);

        if (!current) {
            return threads;
        }

        if (threads.some((thread) => thread.id === current.thread.id)) {
            return threads;
        }

        return [current.thread, ...threads];
    }, [editingId, links, threads]);

    const destinationThreads = useMemo(
        () => threads.filter((thread) => thread.id !== Number(form.data.thread_id)),
        [threads, form.data.thread_id],
    );

    const startCreate = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    const startEdit = (link: Link) => {
        setEditingId(link.id);
        form.setData({
            thread_id: String(link.thread_id),
            linked_thread_id: String(link.linked_thread_id),
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
            form.put(update.url(editingId), options);
        } else {
            form.post(store.url(), options);
        }
    };

    const remove = (link: Link) => {
        if (window.confirm(`Delete the link from "${link.thread.title_eng}"?`)) {
            router.delete(destroy.url(link.id), { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Thread To Thread Link" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <Link
                        href={threadMenusIndex()}
                        className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to thread menus
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Thread To Thread Link
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Link one thread to another so users can navigate the bot.
                    </p>
                </div>

                <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
                    <div className="rounded-xl border p-5 lg:sticky lg:top-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                {editingId !== null ? (
                                    <>
                                        <Pencil className="h-4 w-4 text-primary" aria-hidden="true" />
                                        Edit link
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
                                        New link
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
                                <Label htmlFor="thread">Thread</Label>
                                <Select
                                    value={form.data.thread_id}
                                    onValueChange={(value) =>
                                        form.setData('thread_id', value)
                                    }
                                >
                                    <SelectTrigger id="thread">
                                        <SelectValue placeholder="Select a thread" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectableThreads.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                No unlinked threads available
                                            </div>
                                        ) : (
                                            selectableThreads.map((thread) => (
                                                <SelectItem
                                                    key={thread.id}
                                                    value={String(thread.id)}
                                                >
                                                    {thread.title_eng}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.thread_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="linked-thread">Linked thread</Label>
                                <Select
                                    value={form.data.linked_thread_id}
                                    onValueChange={(value) =>
                                        form.setData('linked_thread_id', value)
                                    }
                                >
                                    <SelectTrigger id="linked-thread">
                                        <SelectValue placeholder="Select a linked thread" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinationThreads.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                No other threads available
                                            </div>
                                        ) : (
                                            destinationThreads.map((thread) => (
                                                <SelectItem
                                                    key={thread.id}
                                                    value={String(thread.id)}
                                                >
                                                    {thread.title_eng}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.linked_thread_id} />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <Spinner />
                                ) : editingId !== null ? (
                                    <Save className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <GitBranch className="h-4 w-4" aria-hidden="true" />
                                )}
                                {editingId !== null ? 'Save changes' : 'Create link'}
                            </Button>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-xl border">
                        {links.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <GitBranch
                                        className="h-6 w-6 text-primary"
                                        aria-hidden="true"
                                    />
                                </span>
                                <p className="font-medium">No thread links yet</p>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    Link a thread to another using the form to the left.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left">
                                        <th className="px-4 py-3 font-medium">Thread</th>
                                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                            Swahili
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Linked thread
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
                                    {links.map((link) => (
                                        <tr
                                            key={link.id}
                                            className={`border-b transition-colors last:border-b-0 hover:bg-muted/30 ${
                                                editingId === link.id ? 'bg-primary/5' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {link.thread.title_eng}
                                            </td>
                                            <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                                {link.thread.title_sw}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">
                                                    {link.linked_thread.title_eng}
                                                </Badge>
                                            </td>
                                            <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                {new Date(
                                                    link.created_at,
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
                                                        aria-label={`Edit link for ${link.thread.title_eng}`}
                                                        onClick={() => startEdit(link)}
                                                    >
                                                        <Pencil className="h-4 w-4" aria-hidden="true" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Delete link for ${link.thread.title_eng}`}
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => remove(link)}
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

ThreadLinks.layout = {
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
            title: 'Thread To Thread Link',
            href: threadLinksIndex(),
        },
    ],
};
