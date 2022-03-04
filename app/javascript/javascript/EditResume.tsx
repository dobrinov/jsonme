import React, { useState } from "react";
import { Resume } from "./resume/Resume";
import { ModalProvider, useModal } from "./ModalProvider";

type EditableResume = {
  resume: Resume;
  onEdit: (resume: Resume) => void;
};

export function EditResume({ resume: loadedResume }: EditableResume) {
  const [resume, setResume] = useState<Resume>(loadedResume);

  return (
    <ModalProvider>
      <Resume {...resume} editable onUpdate={setResume} />
    </ModalProvider>
  );
}
