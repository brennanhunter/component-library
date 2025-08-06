'use client'

export function BGChangeSections() {
   return (
       <div>
           <section className="h-screen bg-black flex items-center justify-center">
               <h1 className="text-white text-4xl font-bold">Black Background</h1>
           </section>

           <section className="h-screen bg-white flex items-center justify-center">
               <h1 className="text-black text-4xl font-bold">White Background</h1>
           </section>

           <section className="h-screen bg-red-500 flex items-center justify-center">
               <h1 className="text-white text-4xl font-bold">Red Background</h1>
           </section>

           <section className="h-screen bg-blue-600 flex items-center justify-center">
               <h1 className="text-white text-4xl font-bold">Blue Background</h1>
           </section>
       </div>
   );
}