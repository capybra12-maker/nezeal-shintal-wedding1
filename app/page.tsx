"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Search,
  Users,
} from "lucide-react";

type Step =
  | "landing"
  | "search"
  | "found"
  | "guest-rsvp"
  | "success";

type GuestInvitation = {
  full_name: string;
  seats_reserved: number;
  invited_people: string[];
};

export default function Home() {
  const [step, setStep] = useState<Step>("landing");

  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [invitation, setInvitation] =
    useState<GuestInvitation | null>(null);

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // IMPORTANT:
  // These values match the Supabase attendance check constraint.
  const [attendance, setAttendance] =
    useState("attending");

  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [guestNames, setGuestNames] =
    useState<string[]>([""]);

  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function searchInvitation(e?: FormEvent) {
    e?.preventDefault();

    const name = searchName.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!supabase) {
      setError("Database connection is not configured.");
      return;
    }

    setSearching(true);
    setError("");
    setNotFound(false);

    try {
      // First try with invited_people.
      const { data, error: searchError } = await supabase
        .from("invited_guests")
        .select(
          "full_name, seats_reserved, invited_people"
        )
        .ilike("full_name", `%${name}%`)
        .limit(1)
        .maybeSingle();

      // If invited_people does not exist yet,
      // fall back to the basic columns.
      if (searchError) {
        const fallback = await supabase
          .from("invited_guests")
          .select("full_name, seats_reserved")
          .ilike("full_name", `%${name}%`)
          .limit(1)
          .maybeSingle();

        if (fallback.error) {
          throw fallback.error;
        }

        if (!fallback.data) {
          setNotFound(true);
          return;
        }

        const found: GuestInvitation = {
          full_name: fallback.data.full_name,
          seats_reserved:
            fallback.data.seats_reserved,
          invited_people: [
            fallback.data.full_name,
          ],
        };

        setInvitation(found);
        setGuestName(found.full_name);
        setNumberOfGuests(
          found.seats_reserved
        );

        setGuestNames(
          Array.from(
            {
              length: found.seats_reserved,
            },
            (_, index) =>
              found.invited_people[index] || ""
          )
        );

        setStep("found");
        return;
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      const people =
        Array.isArray(data.invited_people) &&
        data.invited_people.length > 0
          ? data.invited_people
          : [data.full_name];

      const found: GuestInvitation = {
        full_name: data.full_name,
        seats_reserved:
          data.seats_reserved,
        invited_people: people,
      };

      setInvitation(found);
      setGuestName(found.full_name);
      setNumberOfGuests(
        found.seats_reserved
      );

      setGuestNames(
        Array.from(
          {
            length: found.seats_reserved,
          },
          (_, index) =>
            people[index] || ""
        )
      );

      setStep("found");
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while searching. Please try again."
      );
    } finally {
      setSearching(false);
    }
  }

  function updateNumberOfGuests(
    value: number
  ) {
    const count = Math.max(
      1,
      Math.min(10, value)
    );

    setNumberOfGuests(count);

    setGuestNames((current) => {
      const updated = [...current];

      while (updated.length < count) {
        updated.push("");
      }

      return updated.slice(0, count);
    });
  }

  function updateGuestName(
    index: number,
    value: string
  ) {
    setGuestNames((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  async function submitRSVP(e: FormEvent) {
    e.preventDefault();

    if (!supabase) {
      setError(
        "Database connection is not configured."
      );
      return;
    }

    if (!guestName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (attendance === "attending") {
      const filledGuestNames =
        guestNames.filter(
          (name) => name.trim() !== ""
        );

      if (
        filledGuestNames.length === 0
      ) {
        setError(
          "Please enter at least one guest name."
        );
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const rsvpData = {
        guest_name: guestName.trim(),

        email: email.trim(),

        phone: phone.trim(),

        // This now matches your database constraint.
        attendance,

        number_of_guests:
          attendance === "attending"
            ? numberOfGuests
            : 0,

        guest_names:
          attendance === "attending"
            ? guestNames
                .filter(
                  (name) =>
                    name.trim() !== ""
                )
                .map((name) =>
                  name.trim()
                )
            : [],

        message: message.trim(),
      };

      const { error: rsvpError } =
        await supabase
          .from("rsvps")
          .insert(rsvpData);

      if (rsvpError) {
        console.error(
          "RSVP error:",
          rsvpError
        );

        throw new Error(
          rsvpError.message ||
            "Unable to save your RSVP."
        );
      }

      // If the person was not already in the
      // invitation list, add them so they can
      // search their name later.
      const isExistingInvitation =
        invitation !== null &&
        invitation.full_name
          .toLowerCase() ===
          guestName
            .trim()
            .toLowerCase();

      if (!isExistingInvitation) {
        const people =
          attendance === "attending"
            ? guestNames
                .filter(
                  (name) =>
                    name.trim() !== ""
                )
                .map((name) =>
                  name.trim()
                )
            : [guestName.trim()];

        // Try including invited_people.
        const {
          error: guestInsertError,
        } = await supabase
          .from("invited_guests")
          .insert({
            full_name:
              guestName.trim(),

            seats_reserved:
              attendance ===
              "attending"
                ? numberOfGuests
                : 0,

            invited_people: people,
          });

        // If invited_people is not available,
        // save the basic guest record instead.
        if (guestInsertError) {
          console.warn(
            "Could not save invited_people. Trying basic guest record.",
            guestInsertError
          );

          const {
            error: fallbackGuestError,
          } = await supabase
            .from("invited_guests")
            .insert({
              full_name:
                guestName.trim(),

              seats_reserved:
                attendance ===
                "attending"
                  ? numberOfGuests
                  : 0,
            });

          if (fallbackGuestError) {
            console.error(
              "Guest insert error:",
              fallbackGuestError
            );
          }
        }
      }

      setStep("success");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function addToGoogleCalendar() {
    const start = "20260423T160000";
    const end = "20260423T190000";

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(
        "Nezeal Ven & Shintal Khye Wedding"
      ) +
      "&dates=" +
      start +
      "/" +
      end +
      "&details=" +
      encodeURIComponent(
        "We are getting married! We would love to celebrate this special day with you."
      ) +
      "&location=" +
      encodeURIComponent(
        "E&J Grand Pavilion, DC, Bukidnon"
      );

    window.open(url, "_blank");
  }

  function downloadCalendar() {
    const calendar =
      `BEGIN:VCALENDAR\r\n` +
      `VERSION:2.0\r\n` +
      `BEGIN:VEVENT\r\n` +
      `DTSTART:20260423T160000\r\n` +
      `DTEND:20260423T190000\r\n` +
      `SUMMARY:Nezeal Ven & Shintal Khye Wedding\r\n` +
      `LOCATION:E&J Grand Pavilion, DC, Bukidnon\r\n` +
      `DESCRIPTION:We are getting married! We would love to celebrate this special day with you.\r\n` +
      `END:VEVENT\r\n` +
      `END:VCALENDAR`;

    const blob = new Blob(
      [calendar],
      {
        type: "text/calendar",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "nezeal-shintal-wedding.ics";

    link.click();

    URL.revokeObjectURL(url);
  }

  function resetToSearch() {
    setStep("search");
    setInvitation(null);
    setSearchName("");
    setNotFound(false);
    setError("");
  }

  function resetRSVP() {
    setGuestName("");
    setEmail("");
    setPhone("");

    // Reset to a valid database value.
    setAttendance("attending");

    setNumberOfGuests(1);
    setGuestNames([""]);
    setMessage("");
    setError("");
    setInvitation(null);
    setSearchName("");
  }

  /*
   * LANDING
   */
  if (step === "landing") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#3d3a35]">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fffdf8,_transparent_60%)]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="mb-5 text-sm uppercase tracking-[0.35em] text-[#8b8175]">
              Together with their families
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
              <span className="mx-3 text-[#a99b89]">
                &
              </span>
              Shintal Khye
            </h1>

            <div className="mx-auto my-8 h-px w-24 bg-[#b9ad9d]" />

            <p className="mb-2 text-lg tracking-wide">
              April 23, 2026
            </p>

            <p className="mb-10 text-[#82786c]">
              4:00 PM · E&J Grand Pavilion
            </p>

            <button
              onClick={() =>
                setStep("search")
              }
              className="rounded-full bg-[#4b4741] px-10 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#35322e]"
            >
              Open Invitation
            </button>
          </div>
        </section>
      </main>
    );
  }

  /*
   * SEARCH
   */
  if (step === "search") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] px-6 py-16 text-[#3d3a35]">
        <div className="mx-auto max-w-xl">
          <button
            onClick={() =>
              setStep("landing")
            }
            className="mb-12 flex items-center gap-2 text-sm text-[#82786c]"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
              Your invitation
            </p>

            <h2 className="font-serif text-4xl md:text-5xl">
              Find Your Invitation
            </h2>

            <p className="mx-auto mt-5 max-w-md leading-7 text-[#777067]">
              Please enter the name used on your invitation so we can find your reserved seats.
            </p>

            <form
              onSubmit={searchInvitation}
              className="mt-10"
            >
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9b9185]"
                />

                <input
                  value={searchName}
                  onChange={(e) =>
                    setSearchName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-full border border-[#d8d0c5] bg-white px-14 py-4 outline-none transition focus:border-[#8d8173]"
                />
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {notFound && (
                <div className="mt-8 rounded-2xl border border-[#ded5c9] bg-white p-7 text-center">
                  <p className="font-serif text-2xl">
                    We couldn't find your invitation.
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#777067]">
                    You can still RSVP as a guest below.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      resetRSVP();

                      setGuestName(
                        searchName.trim()
                      );

                      setStep(
                        "guest-rsvp"
                      );
                    }}
                    className="mt-6 rounded-full bg-[#4b4741] px-8 py-3 text-sm uppercase tracking-[0.15em] text-white"
                  >
                    Guest RSVP
                  </button>
                </div>
              )}

              {!notFound && (
                <button
                  type="submit"
                  disabled={searching}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#4b4741] px-8 py-4 text-sm uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  <Search size={17} />

                  {searching
                    ? "Searching..."
                    : "Search Invitation"}
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
    );
  }

  /*
   * FOUND INVITATION
   *
   * IMPORTANT:
   * There is NO Continue to RSVP button here.
   */
  if (
    step === "found" &&
    invitation
  ) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] px-6 py-14 text-[#3d3a35]">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={resetToSearch}
            className="mb-10 flex items-center gap-2 text-sm text-[#82786c]"
          >
            <ChevronLeft size={16} />
            Search again
          </button>

          <div className="rounded-[2rem] border border-[#ded6ca] bg-white p-8 shadow-sm md:p-12">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
                You are invited
              </p>

              <h1 className="mt-5 font-serif text-4xl md:text-5xl">
                {invitation.full_name}
              </h1>

              <div className="mx-auto my-7 h-px w-20 bg-[#c9bdad]" />

              <p className="font-serif text-2xl italic text-[#817669]">
                to celebrate with us
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#f8f5ef] p-5">
                <Calendar
                  size={21}
                  className="mb-3 text-[#8e8275]"
                />

                <p className="text-xs uppercase tracking-widest text-[#9b9185]">
                  Date
                </p>

                <p className="mt-2 font-medium">
                  April 23, 2026
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f5ef] p-5">
                <Clock
                  size={21}
                  className="mb-3 text-[#8e8275]"
                />

                <p className="text-xs uppercase tracking-widest text-[#9b9185]">
                  Time
                </p>

                <p className="mt-2 font-medium">
                  4:00 PM
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f5ef] p-5">
                <MapPin
                  size={21}
                  className="mb-3 text-[#8e8275]"
                />

                <p className="text-xs uppercase tracking-widest text-[#9b9185]">
                  Venue
                </p>

                <p className="mt-2 font-medium">
                  E&J Grand Pavilion
                </p>

                <p className="mt-1 text-sm text-[#777067]">
                  DC, Bukidnon
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f5ef] p-5">
                <Users
                  size={21}
                  className="mb-3 text-[#8e8275]"
                />

                <p className="text-xs uppercase tracking-widest text-[#9b9185]">
                  Reserved Seats
                </p>

                <p className="mt-2 font-medium">
                  {invitation.seats_reserved}{" "}
                  {invitation.seats_reserved ===
                  1
                    ? "seat"
                    : "seats"}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#ded6ca] p-6">
              <div className="flex items-center gap-3">
                <Users
                  size={20}
                  className="text-[#8e8275]"
                />

                <h3 className="font-serif text-2xl">
                  Who is Joining
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                {invitation.invited_people.map(
                  (
                    person,
                    index
                  ) => (
                    <div
                      key={`${person}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-[#f8f5ef] px-4 py-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm">
                        {index + 1}
                      </div>

                      <span>
                        {person}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6 text-center">
              <p className="font-serif text-2xl">
                We can't wait to celebrate with you.
              </p>

              <p className="mt-3 text-sm leading-6 text-[#777067]">
                RSVP deadline: April 5, 2026
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <button
                onClick={
                  addToGoogleCalendar
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm"
              >
                <Calendar size={17} />
                Add to Google Calendar
              </button>

              <button
                onClick={
                  downloadCalendar
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm"
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

  /*
   * GUEST RSVP
   */
  if (step === "guest-rsvp") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] px-6 py-14 text-[#3d3a35]">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={resetToSearch}
            className="mb-10 flex items-center gap-2 text-sm text-[#82786c]"
          >
            <ChevronLeft size={16} />
            Search again
          </button>

          <div className="rounded-[2rem] border border-[#ded6ca] bg-white p-8 shadow-sm md:p-12">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
                Guest RSVP
              </p>

              <h1 className="mt-4 font-serif text-4xl">
                We'd love to hear from you
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#777067]">
                We couldn't find your invitation, but you are still welcome to RSVP as a guest.
              </p>
            </div>

            <form
              onSubmit={submitRSVP}
              className="mt-10 space-y-7"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Your Name *
                </label>

                <input
                  required
                  value={guestName}
                  onChange={(e) =>
                    setGuestName(
                      e.target.value
                    )
                  }
                  placeholder="Full name"
                  className="w-full rounded-xl border border-[#d8d0c5] bg-white px-4 py-3 outline-none focus:border-[#8d8173]"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#d8d0c5] px-4 py-3 outline-none focus:border-[#8d8173]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Contact number"
                    className="w-full rounded-xl border border-[#d8d0c5] px-4 py-3 outline-none focus:border-[#8d8173]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium">
                  Will you be joining us? *
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAttendance(
                        "attending"
                      )
                    }
                    className={`rounded-xl border p-4 text-left ${
                      attendance ===
                      "attending"
                        ? "border-[#625b52] bg-[#f8f5ef]"
                        : "border-[#ddd5ca]"
                    }`}
                  >
                    <p className="font-medium">
                      Yes, I'll be there
                    </p>

                    <p className="mt-1 text-xs text-[#777067]">
                      We look forward to seeing you.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAttendance(
                        "Regretfully declining"
                      )
                    }
                    className={`rounded-xl border p-4 text-left ${
                      attendance ===
                      "Regretfully declining"
                        ? "border-[#625b52] bg-[#f8f5ef]"
                        : "border-[#ddd5ca]"
                    }`}
                  >
                    <p className="font-medium">
                      Sorry, I can't make it
                    </p>

                    <p className="mt-1 text-xs text-[#777067]">
                      We'll miss celebrating with you.
                    </p>
                  </button>
                </div>
              </div>

              {attendance ===
                "attending" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Number of Guests
                    </label>

                    <select
                      value={
                        numberOfGuests
                      }
                      onChange={(e) =>
                        updateNumberOfGuests(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full rounded-xl border border-[#d8d0c5] bg-white px-4 py-3 outline-none"
                    >
                      {Array.from(
                        {
                          length: 10,
                        },
                        (
                          _,
                          index
                        ) =>
                          index + 1
                      ).map(
                        (number) => (
                          <option
                            key={
                              number
                            }
                            value={
                              number
                            }
                          >
                            {number}{" "}
                            {number ===
                            1
                              ? "Guest"
                              : "Guests"}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium">
                      Who is joining?
                    </label>

                    <div className="space-y-3">
                      {guestNames.map(
                        (
                          name,
                          index
                        ) => (
                          <input
                            key={
                              index
                            }
                            required
                            value={
                              name
                            }
                            onChange={(
                              e
                            ) =>
                              updateGuestName(
                                index,
                                e
                                  .target
                                  .value
                              )
                            }
                            placeholder={`Guest ${
                              index +
                              1
                            } name`}
                            className="w-full rounded-xl border border-[#d8d0c5] px-4 py-3 outline-none focus:border-[#8d8173]"
                          />
                        )
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Leave a message for the couple..."
                  className="w-full resize-none rounded-xl border border-[#d8d0c5] px-4 py-3 outline-none focus:border-[#8d8173]"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4b4741] px-8 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-[#35322e] disabled:opacity-60"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Check size={17} />
                    Submit RSVP
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  /*
   * SUCCESS
   */
  if (step === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 py-16 text-[#3d3a35]">
        <div className="w-full max-w-xl rounded-[2rem] border border-[#ded6ca] bg-white p-10 text-center shadow-sm md:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ece5]">
            <Check size={30} />
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#9b8d7b]">
            RSVP Received
          </p>

          <h1 className="mt-4 font-serif text-4xl md:text-5xl">
            Thank You, {guestName}!
          </h1>

          <p className="mx-auto mt-5 max-w-md leading-7 text-[#777067]">
            Your RSVP has been successfully recorded. We are so happy to hear from you and look forward to celebrating together.
          </p>

          <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6">
            <p className="font-serif text-2xl">
              April 23, 2026
            </p>

            <p className="mt-2 text-sm text-[#777067]">
              4:00 PM · E&J Grand Pavilion
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <button
              onClick={
                addToGoogleCalendar
              }
              className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm"
            >
              <Calendar size={17} />
              Google Calendar
            </button>

            <button
              onClick={
                downloadCalendar
              }
              className="flex items-center justify-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm"
            >
              <Calendar size={17} />
              Download Calendar
            </button>
          </div>

          <button
            onClick={() => {
              resetRSVP();
              setStep("search");
            }}
            className="mt-8 text-sm text-[#817669] underline underline-offset-4"
          >
            Search invitation again
          </button>
        </div>
      </main>
    );
  }

  return null;
}
