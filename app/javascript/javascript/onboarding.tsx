import React, { useEffect, useRef, useState } from "react";

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const resume = {
    fullName,
    image: imageUrl,
  };

  const Preview = () => <div>{JSON.stringify(resume)}</div>;

  switch (step) {
    case 1:
      return (
        <div>
          <h1>What is your name?</h1>
          <p>
            This is important because it will be the main information in your
            resume.
          </p>
          <TextInput
            value={fullName}
            placeholder="John Doe"
            onBlur={(event) => setFullName(event.target.value)}
          />
          <button type="button" onClick={() => setStep(2)}>
            Next
          </button>
          <Preview />
        </div>
      );

    case 2:
      return (
        <div>
          <h1>How do you look like?</h1>
          <p>Here you can provide an URL to an photo of yours.</p>
          <TextInput
            value={imageUrl}
            placeholder="An URL of your avatar"
            onBlur={(event) => setImageUrl(event.target.value)}
          />
          <Preview />
          <button type="button" onClick={() => setStep(1)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(3)}>
            Next
          </button>
        </div>
      );

    case 3:
      return (
        <div>
          <h1>Convince me that you are very good</h1>
          <p>Describe your strengths and interests.</p>
          <button type="button" onClick={() => setStep(2)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(4)}>
            Next
          </button>
        </div>
      );

    case 4:
      return (
        <div>
          <h1>Where are you located?</h1>
          <p>
            This might be important for remote workers because of leagal reasons
            and time zone.
          </p>
          <button type="button" onClick={() => setStep(3)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(5)}>
            Next
          </button>
        </div>
      );

    case 5:
      return (
        <div>
          <h1>What is your education?</h1>
          <p>Tell about some your education.</p>
          <button type="button" onClick={() => setStep(4)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(6)}>
            Next
          </button>
        </div>
      );

    case 6:
      return (
        <div>
          <h1>What is your technology stack?</h1>
          <p>
            What technologies have you used/learned so far? How complex problems
            can you solve with them? Do you know any good practices? Do you know
            all of their features? Can you mentor other people? Have you used
            them recently?
          </p>
          <button type="button" onClick={() => setStep(5)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(7)}>
            Next
          </button>
        </div>
      );

    case 7:
      return (
        <div>
          <h1>What is your experience?</h1>
          <p>This information will support the technologies that you listed.</p>
          <button type="button" onClick={() => setStep(6)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(8)}>
            Next
          </button>
        </div>
      );

    case 8:
      return (
        <div>
          <h1>Do you have any side projects?</h1>
          <p>Side projects are another good way to show off your skills.</p>
          <button type="button" onClick={() => setStep(7)}>
            Previous
          </button>
          <button type="button" onClick={() => setStep(9)}>
            Next
          </button>
        </div>
      );

    case 9:
      return (
        <div>
          <h1>Voilà</h1>
          <p>
            Here is how your CV looks like. You can copy/paste the JSON and
            store it locally on your machine. You can also store it in your
            Github. In case the user selects the Github/Gitlab version ask if he
            wants his CV to be indexed.
          </p>
          <button type="button" onClick={() => setStep(8)}>
            Previous
          </button>
          <button type="button" onClick={() => alert("todo")}>
            Store locally (PDF version only)
          </button>
          <button type="button" onClick={() => alert("todo")}>
            Upload to Github/Gitlab (web & pdf versions)
          </button>
        </div>
      );

    default:
      return <div>todo</div>;
  }
}

function TextInput({
  value,
  placeholder,
  onBlur,
}: {
  value: string;
  placeholder?: string;
  onBlur: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.value = value;
  }, [value]);

  return (
    <input
      id="name"
      name="name"
      type="text"
      ref={ref}
      placeholder={placeholder}
      onBlur={onBlur}
    />
  );
}
