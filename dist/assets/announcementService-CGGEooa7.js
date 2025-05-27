import{s as o}from"./index-Uqn10z1H.js";const l=async t=>{try{let e=o.from("announcements").select(`
        *,
        profiles:author_id (full_name)
      `).order("publish_at",{ascending:!1});const{data:r,error:s}=await e;if(s)throw s;if(t&&r.length>0){const c=r.map(a=>a.id),{data:i,error:m}=await o.from("announcement_reads").select("announcement_id").eq("student_id",t).in("announcement_id",c);if(!m&&i){const a=i.map(n=>n.announcement_id),d=c.filter(n=>!a.includes(n));if(d.length>0){const n=d.map(u=>({announcement_id:u,student_id:t}));await o.from("announcement_reads").insert(n)}}}return r||[]}catch(e){throw console.error("Error fetching announcements:",e),e}};export{l as fetchAnnouncements};
