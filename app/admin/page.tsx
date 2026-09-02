"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type RSVP = {
  id: number | string;
  guest_name: string | null;
  email: string | null;
  attendance: string | null;
  guests: number | null;
  message: string | null;
  created_at?: string;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [error, setError] = useState("");

  async function loadRsvps() {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setRsvps(data || []);
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoggedIn(true);

    await loadRsvps();

    setLoading(false);
  }

  async function logout() {
    if (!supabase) return;

    await supabase.auth.signOut();

    setLoggedIn(false);
    setRsvps([]);
  }

  useEffect(() => {
    async function checkLogin() {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setLoggedIn(true);
        await loadRsvps();
      }
    }

    checkLogin();
  }, []);

  /*
   * ATTENDING
   *
   * Your Supabase database currently uses:
   * "attending"
   * "declining"
   */
  const attending = rsvps.filter(
    (rsvp) => rsvp.attendance === "attending"
  );

  const declining = rsvps.filter(
    (rsvp) => rsvp.attendance === "declining"
  );

  const totalGuests = attending.reduce(
    (total, rsvp) => {
      return total + Number(rsvp.guests || 1);
    },
    0
  );

  /*
   * LOGIN SCREEN
   */
  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] flex items-center justify-center px-6">

        <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-sm">

          <div className="text-center mb-8">

            <p className="text-xs tracking-[0.35em] uppercase text-[#9a7654] mb-4">
              Nezeal & Shintal
            </p>

            <h1 className="text-4xl font-serif">
              RSVP Admin
            </h1>

            <p className="text-sm text-neutral-500 mt-3">
              Sign in to view your wedding RSVPs.
            </p>

          </div>

          <form
            onSubmit={login}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="block text-sm mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                placeholder="Admin email"
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-neutral-900"
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-sm mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                placeholder="Password"
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-neutral-900"
              />

            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#29251f] text-white rounded-full py-4 tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

        </div>

      </main>
    );
  }

  /*
   * ADMIN DASHBOARD
   */
  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>

            <p className="text-xs tracking-[0.35em] uppercase text-[#9a7654]">
              Nezeal Ven & Shintal Khye
            </p>

            <h1 className="text-4xl font-serif mt-2">
              RSVP Dashboard
            </h1>

            <p className="text-neutral-500 mt-2">
              April 23, 2026 · E&J Grand Pavilion
            </p>

          </div>

          <button
            onClick={logout}
            className="border border-neutral-300 rounded-full px-6 py-3 text-sm hover:bg-white"
          >
            Sign out
          </button>

        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          {/* Responses */}
          <div className="bg-white rounded-2xl p-7">

            <p className="text-sm text-neutral-500">
              Total Responses
            </p>

            <p className="text-5xl font-serif mt-2">
              {rsvps.length}
            </p>

          </div>

          {/* Attending */}
          <div className="bg-white rounded-2xl p-7">

            <p className="text-sm text-neutral-500">
              Attending
            </p>

            <p className="text-5xl font-serif mt-2">
              {attending.length}
            </p>

          </div>

          {/* Guests */}
          <div className="bg-white rounded-2xl p-7">

            <p className="text-sm text-neutral-500">
              Total Guests
            </p>

            <p className="text-5xl font-serif mt-2">
              {totalGuests}
            </p>

          </div>

        </div>

        {/* RSVP Table */}
        <div className="bg-white rounded-2xl overflow-hidden">

          {/* Table header */}
          <div className="p-6 border-b border-neutral-200">

            <h2 className="text-2xl font-serif">
              Guest Responses
            </h2>

            <p className="text-sm text-neutral-500 mt-1">
              {declining.length} regretfully declining
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="p-6 text-red-600">
              {error}
            </div>
          )}

          {/* Empty */}
          {rsvps.length === 0 ? (

            <div className="p-12 text-center text-neutral-500">
              No RSVPs yet.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-neutral-50">

                  <tr>

                    <th className="px-6 py-4 text-sm">
                      Guest
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Attendance
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Guests
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Message
                    </th>

                    <th className="px-6 py-4 text-sm">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {rsvps.map((rsvp) => (

                    <tr
                      key={rsvp.id}
                      className="border-t border-neutral-100"
                    >

                      {/* Guest */}
                      <td className="px-6 py-4 font-medium">
                        {rsvp.guest_name || "—"}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm">
                        {rsvp.email || "—"}
                      </td>

                      {/* Attendance */}
                      <td className="px-6 py-4 text-sm">

                        {rsvp.attendance === "attending"
                          ? "Joyfully attending"
                          : rsvp.attendance === "declining"
                          ? "Regretfully declining"
                          : rsvp.attendance || "—"}

                      </td>

                      {/* Guests */}
                      <td className="px-6 py-4 text-sm">
                        {rsvp.guests || 1}
                      </td>

                      {/* Message */}
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {rsvp.message || "—"}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-neutral-500 whitespace-nowrap">

                        {rsvp.created_at
                          ? new Date(
                              rsvp.created_at
                            ).toLocaleDateString()
                          : "—"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}