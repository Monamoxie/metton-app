export interface PairOfStrings {
  [key: string]: string | string[];
}

export interface ReactSetStateActionProps<T> {
  [key: string | number]: React.Dispatch<React.SetStateAction<T>>;
}

// todo ::: @depreciated in favour of the generic SetStateProp
export interface SetIsFinishedProps {
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

export type SetStateProp<T> = React.Dispatch<React.SetStateAction<T>>;
