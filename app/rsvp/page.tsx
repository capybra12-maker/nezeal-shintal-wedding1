"use client";

import { useState } from "react";

export default function RSVPPage() {
  const [name, setName] = useState("");

  return (
    <main className="min-h-screen bg-[#faf8f3] px-5 py-16">
      <div className="mx-auto max-w-xl">

        <div className="mb-10 text-center">
          <p className="mb-6 text-sm uppercase tracking-[0.35em] text-gray-500">
            Wedding RSVP
          </p>

          <h1 className="font-serif leading-[0.9] text-gray-800">
            <span className="block text-6xl md:text-8xl">
              Nezeal Ven
            </span>

            <span className="my-3 block text-4xl md:text-5xl">
              &amp;
            </span>

            <span className="block text-6xl md:text-8xl">
              Shintal Khye
            </span>
          </h1>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg md:p-10">

          <h2 className="mb-2 font-serif text-2xl text-gray-800">
            Find Your Name
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Please enter the name used on your invitation.
          </p>

          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Your Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
          />

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-gray-800 py-3.5 font-medium text-white hover:bg-gray-700"
          >
            Continue
          </button>

        </div>
      </div>
    </main>
  );
}
