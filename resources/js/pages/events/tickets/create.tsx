import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ImageUp, QrCode, Save, Ticket } from 'lucide-react';
import { type PointerEvent, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index as eventsIndex } from '@/routes/events';
import { index as ticketsIndex, store } from '@/routes/events/tickets';

type EventInfo = {
    id: number;
    title: string;
};

type Props = {
    event: EventInfo;
};

type QrPlacement = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const MAX_IMAGE_BYTES = 1.9 * 1024 * 1024;
const DEFAULT_PLACEMENT: QrPlacement = {
    x: 62,
    y: 58,
    width: 24,
    height: 24,
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function formatPlacement(value: number): string {
    return value.toFixed(2);
}

export default function CreateTicket({ event }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [qrPlacement, setQrPlacement] =
        useState<QrPlacement>(DEFAULT_PLACEMENT);
    const [isDraggingQr, setIsDraggingQr] = useState(false);

    function updatePlacement(nextPlacement: Partial<QrPlacement>) {
        setQrPlacement((current) => {
            const width = clamp(nextPlacement.width ?? current.width, 5, 100);
            const height = clamp(
                nextPlacement.height ?? current.height,
                5,
                100,
            );

            return {
                x: clamp(nextPlacement.x ?? current.x, 0, 100 - width),
                y: clamp(nextPlacement.y ?? current.y, 0, 100 - height),
                width,
                height,
            };
        });
    }

    function previewFile(file: File | undefined) {
        if (!file) {
            setImagePreview(null);
            setImageError(null);
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            setImagePreview(null);
            setImageError('Image must be 2 MB or smaller.');
            return;
        }

        setImageError(null);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function handleFileDrop(file: File | undefined) {
        previewFile(file);

        if (!file || !fileInputRef.current) {
            return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(file);
        fileInputRef.current.files = transfer.files;
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        if (!isDraggingQr || !previewRef.current) {
            return;
        }

        const bounds = previewRef.current.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        updatePlacement({
            x: x - qrPlacement.width / 2,
            y: y - qrPlacement.height / 2,
        });
    }

    return (
        <>
            <Head title={`New ticket - ${event.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="-ml-3"
                        >
                            <Link href={ticketsIndex(event.id)}>
                                <ArrowLeft
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                Tickets
                            </Link>
                        </Button>
                        <h1 className="mt-2 text-xl font-semibold tracking-tight">
                            New ticket
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {event.title}
                        </p>
                    </div>
                </div>

                <Form
                    {...store.form(event.id)}
                    className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-5 rounded-xl border bg-card p-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">
                                        Ticket name
                                    </Label>
                                    <Input
                                        id="create-name"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="e.g. VIP, Early Bird, Regular"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-price">
                                            Price (TZS)
                                        </Label>
                                        <Input
                                            id="create-price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="e.g. 25000"
                                        />
                                        <InputError message={errors.price} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-quantity">
                                            Quantity
                                        </Label>
                                        <Input
                                            id="create-quantity"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            required
                                            placeholder="e.g. 100"
                                        />
                                        <InputError message={errors.quantity} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-desc">
                                        Description
                                    </Label>
                                    <textarea
                                        id="create-desc"
                                        name="description"
                                        rows={3}
                                        placeholder="What does this ticket include?"
                                        className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="design-image">
                                        Ticket design
                                    </Label>
                                    <label
                                        htmlFor="design-image"
                                        onDragOver={(event) =>
                                            event.preventDefault()
                                        }
                                        onDrop={(event) => {
                                            event.preventDefault();
                                            handleFileDrop(
                                                event.dataTransfer.files[0],
                                            );
                                        }}
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50"
                                    >
                                        <ImageUp
                                            className="h-7 w-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span className="text-sm font-medium">
                                            Drop the ticket image here
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            JPG, PNG or WebP. Max 2 MB.
                                        </span>
                                    </label>
                                    <Input
                                        ref={fileInputRef}
                                        id="design-image"
                                        name="design_image"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) =>
                                            previewFile(event.target.files?.[0])
                                        }
                                    />
                                    <InputError
                                        message={
                                            imageError ?? errors.design_image
                                        }
                                    />
                                </div>

                                <input
                                    type="hidden"
                                    name="qr_code_x"
                                    value={formatPlacement(qrPlacement.x)}
                                />
                                <input
                                    type="hidden"
                                    name="qr_code_y"
                                    value={formatPlacement(qrPlacement.y)}
                                />
                                <input
                                    type="hidden"
                                    name="qr_code_width"
                                    value={formatPlacement(qrPlacement.width)}
                                />
                                <input
                                    type="hidden"
                                    name="qr_code_height"
                                    value={formatPlacement(qrPlacement.height)}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="qr-x">QR left</Label>
                                        <Input
                                            id="qr-x"
                                            type="number"
                                            min="0"
                                            max="95"
                                            step="1"
                                            value={Math.round(qrPlacement.x)}
                                            onChange={(event) =>
                                                updatePlacement({
                                                    x: Number(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="qr-y">QR top</Label>
                                        <Input
                                            id="qr-y"
                                            type="number"
                                            min="0"
                                            max="95"
                                            step="1"
                                            value={Math.round(qrPlacement.y)}
                                            onChange={(event) =>
                                                updatePlacement({
                                                    y: Number(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="qr-width">
                                            QR width
                                        </Label>
                                        <Input
                                            id="qr-width"
                                            type="number"
                                            min="5"
                                            max="100"
                                            step="1"
                                            value={Math.round(
                                                qrPlacement.width,
                                            )}
                                            onChange={(event) =>
                                                updatePlacement({
                                                    width: Number(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="qr-height">
                                            QR height
                                        </Label>
                                        <Input
                                            id="qr-height"
                                            type="number"
                                            min="5"
                                            max="100"
                                            step="1"
                                            value={Math.round(
                                                qrPlacement.height,
                                            )}
                                            onChange={(event) =>
                                                updatePlacement({
                                                    height: Number(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <InputError
                                    message={
                                        errors.qr_code_x ??
                                        errors.qr_code_y ??
                                        errors.qr_code_width ??
                                        errors.qr_code_height
                                    }
                                />

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href={ticketsIndex(event.id)}>
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || imageError !== null
                                        }
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <Save
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                        Create ticket
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-5">
                                <div
                                    ref={previewRef}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={() => setIsDraggingQr(false)}
                                    onPointerLeave={() =>
                                        setIsDraggingQr(false)
                                    }
                                    className="relative mx-auto aspect-[16/9] w-full max-w-4xl touch-none overflow-hidden rounded-lg border bg-muted"
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Ticket design preview"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Ticket
                                                className="h-12 w-12"
                                                aria-hidden="true"
                                            />
                                            <span className="text-sm">
                                                Ticket design preview
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onPointerDown={(event) => {
                                            event.currentTarget.setPointerCapture(
                                                event.pointerId,
                                            );
                                            setIsDraggingQr(true);
                                        }}
                                        className="absolute grid cursor-grab place-items-center border-2 border-primary bg-background/90 text-primary shadow-lg active:cursor-grabbing"
                                        style={{
                                            left: `${qrPlacement.x}%`,
                                            top: `${qrPlacement.y}%`,
                                            width: `${qrPlacement.width}%`,
                                            height: `${qrPlacement.height}%`,
                                        }}
                                        aria-label="QR code placement"
                                    >
                                        <QrCode
                                            className="h-1/2 w-1/2"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CreateTicket.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: eventsIndex(),
        },
        {
            title: 'Tickets',
            href: eventsIndex(),
        },
        {
            title: 'New ticket',
            href: eventsIndex(),
        },
    ],
};
