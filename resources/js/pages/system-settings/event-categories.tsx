import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Spinner } from '@/components/ui/spinner';
import { systemSettings } from '@/routes';
import {
    destroy,
    index as eventCategoriesIndex,
    store,
    update,
} from '@/routes/event-categories';

type Category = {
    id: number;
    name: string;
    slug: string;
    created_at: string;
};

type Props = {
    categories: Category[];
};

function CreateCategoryDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button data-test="create-category-button">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New category
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Event category</DialogTitle>
                    {/* <DialogDescription>
                        Add a category that organizers can assign to their events.
                    </DialogDescription> */}
                </DialogHeader>
                <Form
                    {...store.form()}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="e.g. Music"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function EditCategoryDialog({ category }: { category: Category }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${category.name}`}
                >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit category</DialogTitle>
                    <DialogDescription>
                        Renaming a category also regenerates its slug.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...update.form(category.id)}
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor={`edit-name-${category.id}`}>Name</Label>
                                <Input
                                    id={`edit-name-${category.id}`}
                                    name="name"
                                    required
                                    autoFocus
                                    defaultValue={category.name}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteCategoryDialog({ category }: { category: Category }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${category.name}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {category.name}
                        </span>
                        ? Events already assigned to it are not removed.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...destroy.form(category.id)}
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

export default function EventCategories({ categories }: Props) {
    return (
        <>
            <Head title="Event Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Event Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Categories help attendees find the right events.
                        </p>
                    </div>
                    <CreateCategoryDialog />
                </div>

                {categories.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Tags className="h-6 w-6 text-primary" aria-hidden="true" />
                        </span>
                        <p className="font-medium">No categories yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Create your first event category and it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                        Slug
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
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {category.name}
                                        </td>
                                        <td className="hidden px-4 py-3 sm:table-cell">
                                            <Badge variant="secondary">{category.slug}</Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                            {new Date(category.created_at).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                },
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <EditCategoryDialog category={category} />
                                                <DeleteCategoryDialog category={category} />
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

EventCategories.layout = {
    breadcrumbs: [
        {
            title: 'System Settings',
            href: systemSettings(),
        },
        {
            title: 'Event Categories',
            href: eventCategoriesIndex(),
        },
    ],
};
