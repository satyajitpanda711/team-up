"use client"
import { useState } from "react";

type Props = { data: any };

const isImageUrl = (u: string) =>
    !!u && (u.startsWith("data:image") || /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(u));

function findImageUrl(d: any): string | null {
    if (!d || typeof d !== "object") return null;
    const keys = ["profileImage", "avatar", "image", "photo", "picture"];
    for (const k of keys) {
        const v = d[k];
        if (typeof v === "string" && isImageUrl(v)) return v;
    }
    for (const [, v] of Object.entries(d)) {
        if (typeof v === "string" && isImageUrl(v)) return v;
    }
    return null;
}

export default function Dashboard({ data }: Props) {
    const [showRaw, setShowRaw] = useState(false);

    const entries = data && typeof data === "object" ? Object.entries(data) : [];
    const numericEntries = entries.filter(([, v]) => typeof v === "number");
    const profileUrl = findImageUrl(data);

    const copyJson = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        } catch {
            /* ignore */
        }
    };

    return (
        <div className="p-6">
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {profileUrl ? (
                        <img src={profileUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                    )}
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowRaw((s) => !s)}
                        className="rounded-md px-3 py-1 bg-gray-100 text-sm"
                    >
                        {showRaw ? "Hide JSON" : "Show JSON"}
                    </button>
                    <button
                        onClick={copyJson}
                        className="rounded-md px-3 py-1 bg-blue-600 text-white text-sm"
                    >
                        Copy JSON
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {numericEntries.length ? (
                    numericEntries.map(([k, v]) => (
                        <div key={k} className="rounded-lg p-4 bg-white shadow">
                            <div className="text-sm text-gray-500">{k}</div>
                            <div className="mt-2 text-2xl font-bold">{v as number}</div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-gray-500">No numeric stats to display.</div>
                )}
            </section>

            {entries.length ? (
                <section>
                    {!showRaw ? (
                        <div className="grid gap-2">
                            {entries.map(([k, v]) => (
                                <div
                                    key={k}
                                    className="flex items-start justify-between bg-gray-50 p-3 rounded"
                                >
                                    <div className="text-sm text-gray-700">{k}</div>
                                    <div className="text-sm text-gray-900">
                                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <pre className="rounded bg-black text-white p-4 overflow-auto max-h-96">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    )}
                </section>
            ) : (
                <div className="text-gray-500">No data available.</div>
            )}
        </div>
    );
}