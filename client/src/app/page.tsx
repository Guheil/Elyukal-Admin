'use client'

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('users').select("*");
      if (error) console.error(error);
      else setData(data);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>nagfefetch ba?</h1>
      <ul>
        {data.map((user) => (
          <li key={user.id}>{user.first_name}</li>
        ))}
      </ul>
    </div>
  );
}