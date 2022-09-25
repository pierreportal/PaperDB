export const error = (message: string) => {
  return { error: true, message };
}

export const success = (data: any) => {
  return { error: false, data };
}

export const log = (message: string) => {
  console.log(message);
}

