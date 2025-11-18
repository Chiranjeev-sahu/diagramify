// export function Features() {
//   return (
//     <div className="bg-white border-x border-gray-300 w-[95%] p-4 h-fit flex flex-col items-center">
//       <h1 className="bg-blue-300 text-center w-fit">
//         I will contain examples and usecases with a grid like This
//       </h1>

//       <div className="relative">
//         {/* Center Cross */}
//         {/* <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neutral-400"></div>
//         <div className="absolute left-0 right-0 top-1/2 h-px bg-neutral-400"></div> */}

//         <div className="grid grid-cols-1">
//           <div className="h-[200px] w-6/12 flex items-center justify-center bg-amber-100">
//             DIV - 1
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


export function Features() {
  // ✅ Example feature data (replace with real content)
  const features = [
    {
      title: "Fast Generation",
      description: "Create diagrams in seconds with AI",
    },
    {
      title: "Multiple Formats",
      description: "Support for flowcharts, UML, and more",
    },
    {
      title: "Easy Sharing",
      description: "Export and share your diagrams instantly",
    },
  ];

  return (
    // ✅ Semantic <section>
    <section className="w-[95%] border-x border-gray-300 py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Why Choose Diagramify?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}