export function getUserStorage(key) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return null;

  return localStorage.getItem(`${key}_${user._id}`);
}

export function setUserStorage(key, value) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return;

  localStorage.setItem(`${key}_${user._id}`, value);
}

export function removeUserStorage(key) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return;

  localStorage.removeItem(`${key}_${user._id}`);
}
