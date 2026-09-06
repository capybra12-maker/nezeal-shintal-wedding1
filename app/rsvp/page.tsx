"use client";

import { FormEvent, useState } from "react";
import {
  Check,
  ChevronLeft,
  Heart,
  Minus,
  Plus,
} from "lucide-react";

export default function RSVPPage() {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<
    "attending" | "not_attending" | ""
  >("");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Supabase connection will be added later.
    console.log({
      name,
      attendance,
      guestCount,
      message,
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-14 text-[#3d3a35]">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-10 flex items-center gap-2 text-sm text-[#82786c] transition hover:text-[#4b4741]"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="text-center">

          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
            Your Response
          </p>

          <div className="mb-5 flex justify-center">
            <Heart
              size={28}
              strokeWidth={1}
              className="text-[#9b8d7b]"
            />
          </div>

          <h1 className="font-serif leading-[0.95] text-[#3d3a35]">

            <span className="block text-6xl md:text-8xl">
              Nezeal Ven
            </span>

            <span className="my-3 block text-4xl text-[#a99b89] md:text-5xl">
              &amp;
            </span>

            <span className="block text-6xl md:text-8xl">
              Shintal Khye
            </span>

          </h1>

          <div className="mx-auto my-8 h-px w-20 bg-[#c9bdad]" />

          <p className="font-serif text-2xl italic text-[#817669]">
            Kindly RSVP
          </p>

          <p className="mx-auto mt-4 max-w-md leading-7 text-[#777067]">
            We would be delighted to celebrate this special day with you.
            Please let us know if you will be joining us.
          </p>

        </div>

        {/* RSVP Card */}
        <div className="mt-10 rounded-[2rem] border border-[#ded6ca] bg-white p-7 shadow-sm md:p-12">

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs uppercase tracking-[0.25em] text-[#9b9185]"
              >
                Your Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-full border border-[#d8d0c5] bg-[#fffdfa] px-6 py-4 text-[#3d3a35] outline-none transition placeholder:text-[#aaa196] focus:border-[#8d8173]"
              />
            </div>

            {/* Attendance */}
            <div className="mt-8">

              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#9b9185]">
                Will You Be Joining Us?
              </p>

              <div className="grid gap-3 md:grid-cols-2">

                <button
                  type="button"
                  onClick={() => setAttendance("attending")}
                  className={`rounded-full border px-5 py-4 text-sm transition ${
                    attendance === "attending"
                      ? "border-[#4b4741] bg-[#4b4741] text-white"
                      : "border-[#cfc5b8] bg-white text-[#4b4741] hover:border-[#8d8173]"
                  }`}
                >
                  Joyfully Accepts
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance("not_attending")}
                  className={`rounded-full border px-5 py-4 text-sm transition ${
                    attendance === "not_attending"
                      ? "border-[#4b4741] bg-[#4b4741] text-white"
                      : "border-[#cfc5b8] bg-white text-[#4b4741] hover:border-[#8d8173]"
                  }`}
                >
                  Regretfully Declines
                </button>

              </div>
            </div>

            {/* Guest Count */}
            <div className="mt-8">

              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#9b9185]">
                Number of Guests
              </p>

              <div className="flex items-center justify-between rounded-2xl bg-[#f8f5ef] px-5 py-4">

                <div>
                  <p className="font-serif text-xl">
                    Guests Attending
                  </p>

                  <p className="mt-1 text-sm text-[#777067]">
                    Including yourself
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setGuestCount((count) =>
                        Math.max(1, count - 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cfc5b8] bg-white transition hover:bg-[#eee9e1]"
                    aria-label="Decrease guest count"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-8 text-center text-lg">
                    {guestCount}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setGuestCount((count) =>
                        Math.min(10, count + 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cfc5b8] bg-white transition hover:bg-[#eee9e1]"
                    aria-label="Increase guest count"
                  >
                    <Plus size={16} />
                  </button>

                </div>

              </div>
            </div>

            {/* Message */}
            <div className="mt-8">

              <label
                htmlFor="message"
                className="mb-2 block text-xs uppercase tracking-[0.25em] text-[#9b9185]"
              >
                Message to the Couple
              </label>

              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message for Nezeal & Shintal..."
                rows={5}
                className="w-full resize-none rounded-2xl border border-[#d8d0c5] bg-[#fffdfa] px-5 py-4 text-[#3d3a35] outline-none transition placeholder:text-[#aaa196] focus:border-[#8d8173]"
              />

            </div>

            {/* Deadline */}
            <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6 text-center">

              <p className="font-serif text-2xl">
                We can't wait to celebrate with you.
              </p>

              <p className="mt-3 text-sm leading-6 text-[#777067]">
                RSVP deadline: April 5, 2026
              </p>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!attendance}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#4b4741] px-8 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-[#35322e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} />
              Submit RSVP
            </button>

            {/* Can't find name */}
            <div className="mt-8 rounded-2xl border border-[#ded5c9] bg-white p-6 text-center">

              <p className="font-serif text-2xl">
                Can't find your name?
              </p>

              <p className="mt-3 text-sm leading-6 text-[#777067]">
                Please contact the couple for assistance with your invitation.
              </p>

              <div className="mt-5 text-sm text-[#817669]">
                <p>Shintal Khye</p>
                <p>Nezeal Ven</p>
              </div>

            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="py-10 text-center">

          <Heart
            size={20}
            strokeWidth={1}
            className="mx-auto text-[#a99b89]"
          />

          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#9b9185]">
            Nezeal Ven &amp; Shintal Khye
          </p>

          <p className="mt-2 text-xs text-[#aaa196]">
            April 23, 2026 · 4:00 PM
          </p>

        </div>

      </div>
    </main>
  );
}
