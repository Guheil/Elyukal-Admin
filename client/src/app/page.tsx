'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
    async function fetchData() {
      const { data, error } = await supabase.from('users').select("*");
      if (error) console.error(error);
      else setData(data);
    }
    fetchData();
  }, [router]); 

  return (
    <div>
      <h1></h1>
      <ul>
        {data.map((user) => (
          <li key={user.id}>{user.first_name}</li>
        ))}
      </ul>
    </div>
  );
}