"use client";

import { FormEvent, useState } from "react";
import {
  Calendar,
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
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateGuestCount(count: number) {
    const newCount = Math.max(1, Math.min(10, count));

    setGuestCount(newCount);

    const additionalGuests = Math.max(0, newCount - 1);

    setGuestNames((current) => {
      const updated = [...current];

      while (updated.length < additionalGuests) {
        updated.push("");
      }

      return updated.slice(0, additionalGuests);
    });
  }

  function updateGuestName(index: number, value: string) {
    setGuestNames((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !attendance) {
      return;
    }

    setSubmitted(true);

    console.log({
      name,
      attendance,
      guestCount,
      guestNames,
      message,
    });
  }

  function addToGoogleCalendar() {
    const start = "20260423T160000";
    const end = "20260423T190000";

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent("Nezeal Ven & Shintal Khye Wedding") +
      "&dates=" +
      start +
      "/" +
      end +
      "&details=" +
      encodeURIComponent(
        "We are getting married! We would love to celebrate this special day with you."
      ) +
      "&location=" +
      encodeURIComponent("E&J Grand Pavilion, DC, Bukidnon");

    window.open(url, "_blank");
  }

  function downloadCalendar() {
    const calendar =
      `BEGIN:VCALENDAR\r\n` +
      `VERSION:2.0\r\n` +
      `PRODID:-//Nezeal Ven & Shintal Khye//Wedding//EN\r\n` +
      `BEGIN:VEVENT\r\n` +
      `DTSTART:20260423T160000\r\n` +
      `DTEND:20260423T190000\r\n` +
      `SUMMARY:Nezeal Ven & Shintal Khye Wedding\r\n` +
      `LOCATION:E&J Grand Pavilion, DC, Bukidnon\r\n` +
      `DESCRIPTION:We are getting married! We would love to celebrate this special day with you.\r\n` +
      `BEGIN:VALARM\r\n` +
      `TRIGGER:-P1D\r\n` +
      `ACTION:DISPLAY\r\n` +
      `DESCRIPTION:Wedding tomorrow - Nezeal Ven & Shintal Khye\r\n` +
      `END:VALARM\r\n` +
      `END:VEVENT\r\n` +
      `END:VCALENDAR`;

    const blob = new Blob([calendar], {
      type: "text/calendar",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "nezeal-shintal-wedding.ics";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] px-6 py-14 text-[#3d3a35]">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-[#ded6ca] bg-white p-8 text-center shadow-sm md:p-14">
            <Heart
              size={38}
              strokeWidth={1}
              className="mx-auto text-[#9b8d7b]"
            />

            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
              Thank You
            </p>

            <h1 className="mt-4 font-serif text-4xl md:text-5xl">
              We can't wait to celebrate with you.
            </h1>

            <div className="mx-auto my-7 h-px w-20 bg-[#c9bdad]" />

            <p className="leading-7 text-[#777067]">
              Your RSVP has been received.
            </p>

            <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6">
              <p className="font-serif text-2xl">
                Nezeal Ven &amp; Shintal Khye
              </p>

              <p className="mt-3 text-sm text-[#777067]">
                April 23, 2026 · 4:00 PM
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={addToGoogleCalendar}
                className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm transition hover:bg-[#f8f5ef]"
              >
                <Calendar size={17} />
                Google Calendar
              </button>

              <button
                type="button"
                onClick={downloadCalendar}
                className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm transition hover:bg-[#f8f5ef]"
              >
                <Calendar size={17} />
                Download Calendar
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-14 text-[#3d3a35]">
      <div className="mx-auto max-w-2xl">

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-10 flex items-center gap-2 text-sm text-[#82786c]"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Wedding Header */}
        <div className="text-center">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
            Your Response
          </p>

          <div className="mb-6 flex justify-center">
            <Heart
              size={32}
              strokeWidth={1}
              className="text-[#9b8d7b]"
            />
          </div>

          <p className="mb-4 font-serif text-lg italic text-[#817669]">
            We are getting married
          </p>

          <h1 className="font-serif text-5xl leading-tight md:text-7xl">
            Nezeal Ven
            <span className="mx-3 text-[#a99b89]">&amp;</span>
            Shintal Khye
          </h1>

          <div className="mx-auto my-8 h-px w-24 bg-[#b9ad9d]" />

          <p className="text-lg tracking-wide">
            April 23, 2026
          </p>

          <p className="mt-2 text-[#82786c]">
            4:00 PM · E&amp;J Grand Pavilion
          </p>
        </div>

        {/* RSVP FORM */}
        <div className="mt-12 rounded-[2rem] border border-[#ded6ca] bg-white p-7 shadow-sm md:p-12">

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
              Kindly Respond
            </p>

            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              RSVP
            </h2>

            <p className="mx-auto mt-4 max-w-md leading-7 text-[#777067]">
              We would love to celebrate this special day with you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10">

            {/* Main Guest */}
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
                placeholder="Enter your full name"
                required
                className="w-full rounded-full border border-[#d8d0c5] bg-white px-6 py-4 outline-none transition placeholder:text-[#aaa196] focus:border-[#8d8173]"
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
                      : "border-[#cfc5b8] bg-white hover:border-[#8d8173]"
                  }`}
                >
                  Joyfully Accepts
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttendance("not_attending");
                    updateGuestCount(1);
                  }}
                  className={`rounded-full border px-5 py-4 text-sm transition ${
                    attendance === "not_attending"
                      ? "border-[#4b4741] bg-[#4b4741] text-white"
                      : "border-[#cfc5b8] bg-white hover:border-[#8d8173]"
                  }`}
                >
                  Regretfully Declines
                </button>
              </div>
            </div>

            {/* Guests */}
            {attendance === "attending" && (
              <div className="mt-8">

                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#9b9185]">
                  Number of Guests
                </p>

                <div className="flex items-center justify-between rounded-2xl bg-[#f8f5ef] px-5 py-5">

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
                        updateGuestCount(guestCount - 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cfc5b8] bg-white"
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
                        updateGuestCount(guestCount + 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cfc5b8] bg-white"
                      aria-label="Increase guest count"
                    >
                      <Plus size={16} />
                    </button>

                  </div>
                </div>

                {/* Additional Guest Names */}
                {guestCount > 1 && (
                  <div className="mt-6 space-y-4">

                    <p className="text-xs uppercase tracking-[0.25em] text-[#9b9185]">
                      Additional Guest Names
                    </p>

                    {guestNames.map((guestName, index) => (
                      <div key={index}>
                        <label
                          htmlFor={`guest-${index}`}
                          className="mb-2 block text-sm text-[#777067]"
                        >
                          Guest {index + 1}
                        </label>

                        <input
                          id={`guest-${index}`}
                          type="text"
                          value={guestName}
                          onChange={(e) =>
                            updateGuestName(
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`Enter guest ${index + 1} name`}
                          required
                          className="w-full rounded-full border border-[#d8d0c5] bg-white px-6 py-4 outline-none transition placeholder:text-[#aaa196] focus:border-[#8d8173]"
                        />
                      </div>
                    ))}

                  </div>
                )}
              </div>
            )}

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
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#d8d0c5] bg-white px-5 py-4 outline-none transition placeholder:text-[#aaa196] focus:border-[#8d8173]"
              />
            </div>

            {/* Deadline */}
            <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6 text-center">
              <p className="font-serif text-2xl">
                We can't wait to celebrate with you.
              </p>

              <p className="mt-3 text-sm text-[#777067]">
                RSVP deadline: April 5, 2026
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || !attendance}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#4b4741] px-8 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-[#35322e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} />
              Submit RSVP
            </button>

          </form>

        </div>

        {/* Calendar */}
        <div className="py-10 text-center">

          <p className="font-serif text-2xl">
            Don't forget the date
          </p>

          <p className="mt-2 text-sm text-[#777067]">
            Save our wedding day to your calendar.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={addToGoogleCalendar}
              className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] bg-white px-5 py-3 text-sm transition hover:bg-[#eee9e1]"
            >
              <Calendar size={17} />
              Add to Google Calendar
            </button>

            <button
              type="button"
              onClick={downloadCalendar}
              className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] bg-white px-5 py-3 text-sm transition hover:bg-[#eee9e1]"
            >
              <Calendar size={17} />
              Download Calendar
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}
