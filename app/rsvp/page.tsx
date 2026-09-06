```tsx
"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Guest = {
  id: string;
  name: string;
  max_guests?: number;
};

export default function RSVPPage() {
  const [name, setName] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [attendance, setAttendance] = useState<
    "attending" | "not_attending" | ""
  >("");

  const [guestCount, setGuestCount] = useState("1");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function findGuest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSearching(true);
    setNotFound(false);
    setGuest(null);
    setError("");

    const { data, error: searchError } = await supabase
      .from("guests")
      .select("id, name, max_guests")
      .ilike("name", `%${name.trim()}%`)
      .limit(1)
      .maybeSingle();

    setSearching(false);

    if (searchError) {
      console.error(searchError);
      setError("Something went wrong. Please try again.");
      return;
    }

    if (!data) {
      setNotFound(true);
      return;
    }

    setGuest(data);
    setGuestCount("1");
  }

  async function submitRSVP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!guest) {
      setError("Please find your name first.");
      return;
    }

    if (!attendance) {
      setError("Please select whether you are attending.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: submitError } = await supabase
      .from("rsvps")
      .insert({
        guest_id: guest.id,
        guest_name: guest.name,
        attendance,
        guest_count:
          attendance === "attending" ? Number(guestCount) : 0,
        message: message.trim() || null,
      });

    setSubmitting(false);

    if (submitError) {
      console.error(submitError);
      setError("We couldn't submit your RSVP. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  function searchAgain() {
    setGuest(null);
    setAttendance("");
    setGuestCount("1");
    setMessage("");
    setError("");
    setNotFound(false);
  }

  /* =========================
     THANK YOU PAGE
  ========================= */

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 text-center">

            <div className="text-5xl mb-6">
              💍
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-5">
              Thank You!
            </h1>

            <p className="text-gray-600 text-lg">
              Your RSVP has been received.
            </p>

            <p className="text-gray-500 mt-2">
              We can&apos;t wait to celebrate with you!
            </p>

            <div className="mt-8">
              <p className="text-2xl md:text-3xl font-serif text-gray-800">
                Nezeal Ven &amp; Shintal Khye
              </p>
            </div>

          </div>
        </div>
      </main>
    );
  }

  /* =========================
     MAIN RSVP PAGE
  ========================= */

  return (
    <main className="min-h-screen bg-[#faf8f3] px-5 py-10 md:py-16">

      <div className="max-w-xl mx-auto">

        {/* =========================
            LARGE COUPLE NAME
        ========================= */}

        <div className="text-center mb-10">

          <p className="text-sm md:text-base uppercase tracking-[0.35em] text-gray-500 mb-6">
            Wedding RSVP
          </p>

          <h1 className="font-serif font-semibold text-gray-800 leading-[0.9]">

            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
              Nezeal Ven
            </span>

            <span className="block text-4xl sm:text-5xl md:text-6xl my-3">
              &amp;
            </span>

            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
              Shintal Khye
            </span>

          </h1>

          <p className="text-gray-500 text-base md:text-lg mt-8">
            We would love to celebrate this special day with you.
          </p>

        </div>

        {/* =========================
            RSVP CARD
        ========================= */}

        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10">

          {/* =========================
              FIND GUEST
          ========================= */}

          {!guest && (
            <div>

              <h2 className="text-2xl font-serif text-gray-800 mb-2">
                Find Your Name
              </h2>

              <p className="text-gray-500 text-sm mb-6">
                Please enter the name used on your invitation.
              </p>

              <form onSubmit={findGuest}>

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
                  onChange={(e) => {
                    setName(e.target.value);
                    setNotFound(false);
                    setError("");
                  }}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />

                <button
                  type="submit"
                  disabled={searching}
                  className="w-full mt-4 rounded-xl bg-gray-800 text-white py-3.5 font-medium transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching
                    ? "Finding your name..."
                    : "Continue"}
                </button>

              </form>

              {/* =========================
                  NAME NOT FOUND
              ========================= */}

              {notFound && (
                <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-5 text-center">

                  <p className="font-medium text-gray-800">
                    Can&apos;t find your name?
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Please contact the couple.
                  </p>

                </div>
              )}

              {/* ERROR */}

              {error && (
                <p className="text-red-500 text-sm mt-4 text-center">
                  {error}
                </p>
              )}

            </div>
          )}

          {/* =========================
              RSVP FORM
          ========================= */}

          {guest && (
            <form onSubmit={submitRSVP}>

              {/* Guest Name */}

              <div className="text-center mb-8">

                <p className="text-sm text-gray-500 mb-2">
                  Welcome,
                </p>

                <h2 className="text-3xl md:text-4xl font-serif text-gray-800">
                  {guest.name}
                </h2>

              </div>

              {/* =========================
                  ATTENDANCE
              ========================= */}

              <div className="mb-7">

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Will you be attending?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* ATTENDING */}

                  <button
                    type="button"
                    onClick={() => {
                      setAttendance("attending");
                      setError("");
                    }}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      attendance === "attending"
                        ? "border-gray-800 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                    }`}
                  >

                    <span className="block font-medium">
                      Yes, I&apos;ll be there
                    </span>

                    <span
                      className={`block text-sm mt-1 ${
                        attendance === "attending"
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      I&apos;m excited to celebrate!
                    </span>

                  </button>

                  {/* NOT ATTENDING */}

                  <button
                    type="button"
                    onClick={() => {
                      setAttendance("not_attending");
                      setError("");
                    }}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      attendance === "not_attending"
                        ? "border-gray-800 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                    }`}
                  >

                    <span className="block font-medium">
                      Sorry, I can&apos;t make it
                    </span>

                    <span
                      className={`block text-sm mt-1 ${
                        attendance === "not_attending"
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      I&apos;ll be celebrating from afar.
                    </span>

                  </button>

                </div>

              </div>

              {/* =========================
                  NUMBER OF GUESTS
              ========================= */}

              {attendance === "attending" && (
                <div className="mb-7">

                  <label
                    htmlFor="guestCount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Number of guests attending
                  </label>

                  <select
                    id="guestCount"
                    value={guestCount}
                    onChange={(e) =>
                      setGuestCount(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >

                    {Array.from(
                      {
                        length: Math.max(
                          1,
                          Number(guest.max_guests || 1)
                        ),
                      },
                      (_, i) => i + 1
                    ).map((number) => (

                      <option
                        key={number}
                        value={number}
                      >
                        {number}{" "}
                        {number === 1
                          ? "Guest"
                          : "Guests"}
                      </option>

                    ))}

                  </select>

                </div>
              )}

              {/* =========================
                  MESSAGE
              ========================= */}

              <div className="mb-7">

                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message{" "}
                  <span className="text-gray-400 font-normal">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="message"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Leave a message for the couple..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />

              </div>

              {/* =========================
                  ERROR
              ========================= */}

              {error && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4">

                  <p className="text-red-600 text-sm text-center">
                    {error}
                  </p>

                </div>
              )}

              {/* =========================
                  SUBMIT
              ========================= */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gray-800 text-white py-4 font-medium transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting RSVP..."
                  : "Submit RSVP"}
              </button>

              {/* =========================
                  SEARCH AGAIN
              ========================= */}

              <button
                type="button"
                onClick={searchAgain}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800 transition py-2"
              >
                Not {guest.name}? Search again
              </button>

            </form>
          )}

        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <p className="text-center text-xs text-gray-400 mt-6">
          Thank you for being part of our special day.
        </p>

      </div>

    </main>
  );
}
```
