```tsx
"use client";

import { useState } from "react";

export default function RSVPPage() {
  const [name, setName] = useState("");

  return (
    <main className="min-h-screen bg-[#faf8f3] px-5 py-16">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-gray-500 mb-6">
            Wedding RSVP
          </p>

          <h1 className="font-serif text-gray-800 leading-[0.9]">
            <span className="block text-6xl md:text-8xl">
              Nezeal Ven
            </span>

            <span className="block text-4xl md:text-5xl my-3">
              &amp;
            </span>

            <span className="block text-6xl md:text-8xl">
              Shintal Khye
            </span>
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10">

          <h2 className="text-2xl font-serif text-gray-800 mb-2">
            Find Your Name
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Please enter the name used on your invitation.
          </p>

          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full mt-4 rounded-xl bg-gray-800 text-white py-3.5 font-medium hover:bg-gray-700"
          >
            Continue
          </button>

        </div>

      </div>
    </main>
  );
}
```
