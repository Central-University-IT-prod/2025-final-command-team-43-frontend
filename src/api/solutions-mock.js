const solData = [
  {
    "id": 1474532454,
    "author": {"id": 1, "username": "user"},
    "points": 0,
    "content": "test",
    "is_checked": false,
    "is_successful": false,
    "task": "abc123"
  },
  {
    "id": 1474123454,
    "author": {"id": 1, "username": "user"},
    "points": 0,
    "content": "test2",
    "is_checked": true,
    "is_successful": false,
    "task": "def456"
  },
  {
    "id": 1463432454,
    "author": {"id": 1, "username": "user"},
    "points": 0,
    "content": null,
    "file": "/test.txt",
    "is_checked": false,
    "is_successful": false,
    "task": "ghi789"
  },
]

export function getAllSolutions(contestId) {
  return solData;
}

export function getUncheckedSolutions(contestId) {
  return solData.filter(sol => !sol.is_checked);
}
