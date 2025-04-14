export interface PairOfStrings {
  [key: string]: string | string[];
}

export interface ReactSetStateActionProps<T> {
  [key: string | number]: React.Dispatch<React.SetStateAction<T>>;
}

export interface SetIsFinishedProps {
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}
