"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RsvpForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Save the form reference BEFORE the async operation
    const form = e.currentTarget;

    setLoading(true);
    setStatus("");

    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const attendance = String(formData.get("attendance") || "");
    const guests = Number(formData.get("guests") || 1);
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !attendance) {
      setStatus("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (!supabase) {
      setStatus(
        "Supabase is not configured. Please check your .env.local file."
      );
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("rsvps").insert({
        name,
        email,
        attendance,
        guests,
        message,
      });

      if (error) {
        console.error("Supabase error:", error);
        setStatus(`Unable to send RSVP: ${error.message}`);
        setLoading(false);
        return;
      }

      // Reset using the saved form reference
      form.reset();

      setStatus("Thank you! Your RSVP has been received. ❤️");
    } catch (error) {
      console.error("RSVP error:", error);
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-sm tracking-[0.35em] uppercase text-neutral-600 mb-4">
          Kindly Respond
        </p>

        <h2 className="text-4xl md:text-5xl font-serif text-neutral-900">
          Will you celebrate with us?
        </h2>

        <p className="mt-5 text-neutral-600">
          Please RSVP by April 5, 2026.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-7">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium tracking-[0.25em] uppercase mb-3"
          >
            Your Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full border-b border-neutral-300 bg-transparent px-1 py-3 outline-none focus:border-neutral-900"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium tracking-[0.25em] uppercase mb-3"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="w-full border-b border-neutral-300 bg-transparent px-1 py-3 outline-none focus:border-neutral-900"
          />
        </div>

        {/* Attendance + Guests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div>
            <label
              htmlFor="attendance"
              className="block text-sm font-medium tracking-[0.25em] uppercase mb-3"
            >
              Attendance
            </label>

            <select
              id="attendance"
              name="attendance"
              required
              defaultValue="Joyfully attending"
              className="w-full border-b border-neutral-300 bg-transparent px-1 py-3 outline-none focus:border-neutral-900"
            >
              <option value="Joyfully attending">
                Joyfully attending
              </option>

              <option value="Regretfully declining">
                Regretfully declining
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="guests"
              className="block text-sm font-medium tracking-[0.25em] uppercase mb-3"
            >
              Guests
            </label>

            <input
              id="guests"
              name="guests"
              type="number"
              min="1"
              max="10"
              defaultValue="1"
              required
              className="w-full border-b border-neutral-300 bg-transparent px-1 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium tracking-[0.25em] uppercase mb-3"
          >
            Message (Optional)
          </label>

          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="A little note for the couple..."
            className="w-full border-b border-neutral-300 bg-transparent px-1 py-3 outline-none resize-none focus:border-neutral-900"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-neutral-900 text-white py-5 tracking-[0.25em] uppercase font-medium transition hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send RSVP"}
        </button>

        {/* Status */}
        {status && (
          <p
            className={`text-center text-sm ${
              status.includes("Thank you")
                ? "text-green-700"
                : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </section>
  );
}