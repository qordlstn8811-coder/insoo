export default function Loading() {
    const cards = Array.from({ length: 12 });

    return (
        <main className="min-h-screen bg-gray-50 pb-20 pt-24">
            <section className="bg-blue-900 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mx-auto h-8 w-48 animate-pulse rounded bg-blue-800/70" />
                    <div className="mt-4 h-4 w-full animate-pulse rounded bg-blue-800/50" />
                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-blue-800/50" />
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-2xl bg-white shadow-md"
                        >
                            <div className="aspect-video w-full animate-pulse bg-gray-200" />
                            <div className="p-6">
                                <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
                                <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
