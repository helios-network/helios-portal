export const getErrorMessage = (error: any) => {
  console.log(JSON.parse(JSON.stringify(error)));
  if (error && error.data && error.data.message) {
    let errorMessage = error.data.message;
    errorMessage = errorMessage.replace("rpc error: code = Internal desc = ", "");
    errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
    if (!errorMessage.endsWith(".")) {
      errorMessage += ".";
    }

    return errorMessage;
  }

  if (error.message) {
    let errorMessage = error.message;
    if (errorMessage.includes("User denied")) {
      errorMessage = "User denied transaction signature.";
    }

    return errorMessage;
  }

  return false;
};
