const data = [
  {
    "id": 1,
    "title": "My contest",
    "description": "Lorem ipsum $x_i = y \\cdot z$\n\n# GOYDA",
    "start_datetime": "2025-03-01T00:00:00.000Z",
    "end_datetime": "2025-03-03T00:00:00.000Z",
    "stage": "in_progress",
    "organisators": [
      {
        "id": 1,
        "username": "Test"
      }
    ],
    "tasks": [
      {
        "id": "ghi789",
        "title": "Test 1",
        "description": "$Hello KaTeX$",
        "org_text": "$Hello KaTeX$",
        "org_files": ['file.txt'],
        "user_files": ['ufile.txt'],
        "answer_type": "file",
        "max_points": 100,
      },
      {
        "id": "abc123",
        "title": "Test 2",
        "description": "$Hello KaTeX$",
        "org_text": "$Hello KaTeX$",
        "org_files": ['file.txt'],
        "user_files": ['ufile.txt'],
        "answer_type": "text",
        "max_points": 100,
      },
      {
        "id": "def456",
        "title": "Test 3",
        "description": "$Hello KaTeX$",
        "org_text": "$Hello KaTeX$",
        "org_files": ['file.txt'],
        "user_files": ['ufile.txt'],
        "answer_type": "text",
        "max_points": 100,
      }
    ]
  }
]


export function getContests() {
  return data;
}

export function getContest(contestId) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id == contestId) {
      return data[i];
    }
  }
  return null;
}

const solData = [
  {
    "id": 1473853834,
    "author": {"id": 1, "username": "user"},
    "points": 100,
    "is_successful": true
  },
  {
    "id": 1474532454,
    "author": {"id": 1, "username": "user"},
    "points": 70,
    "is_successful": false
  },
]

export function getTask(contestId, taskId) {
  const contest = getContest(contestId);
  if (!contest) return null;
  for (let i = 0; i < contest.tasks.length; i++) {
    const task = contest.tasks[i];
    if (task.id == taskId) {
      return task;
    }
  }
  return null;
}

export function getMySolutions(contestId) {
  return {1: solData, 2: solData, 3: solData}
}


export function getOpenSolutions(contestId, taskId) {
  return {1: solData, 2: solData, 3: solData}
}
