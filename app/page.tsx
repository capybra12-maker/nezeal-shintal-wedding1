"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Search,
  Users,
} from "lucide-react";

type Step = "landing" | "search" | "found";

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
      const { data, error: searchError } = await supabase
        .from("invited_guests")
        .select(
          "full_name, seats_reserved, invited_people"
        )
        .ilike("full_name", `%${name}%`)
        .limit(1)
        .maybeSingle();

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
          seats_reserved: fallback.data.seats_reserved,
          invited_people: [
            fallback.data.full_name,
          ],
        };

        setInvitation(found);
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
        seats_reserved: data.seats_reserved,
        invited_people: people,
      };

      setInvitation(found);
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

  function resetToSearch() {
    setStep("search");
    setInvitation(null);
    setSearchName("");
    setNotFound(false);
    setError("");
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

    const blob = new Blob([calendar], {
      type: "text/calendar",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      "nezeal-shintal-wedding.ics";

    link.click();

    URL.revokeObjectURL(url);
  }

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
                  onChange={(e) => {
                    setSearchName(
                      e.target.value
                    );
                    setNotFound(false);
                    setError("");
                  }}
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
              )}

              <button
                type="submit"
                disabled={searching}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#4b4741] px-8 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-[#35322e] disabled:opacity-60"
              >
                <Search size={17} />

                {searching
                  ? "Searching..."
                  : "Search Invitation"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

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

  return null;
}
