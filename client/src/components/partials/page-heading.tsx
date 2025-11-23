import React from "react";

import { Separator } from "../ui/separator";

function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <section className="w-full max-md:text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-heading font-orbitron">
          {title}
        </h1>
        <p className="mt-2 lg:text-lg md:text-base text-sm max-w-2xl">
          {description}
        </p>
      </section>

      <Separator className="mt-6 mb-12" />
    </>
  );
}

export default PageHeading;
