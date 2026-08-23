// Constants
export const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c"];
export const record = [
    { _id: 1, user_id: { name: "John Doe" }, placement_id: { company_name: "Google", job_title: "Software Engineer" } },
    { _id: 2, user_id: { name: "John Doe" }, placement_id: { company_name: "Google", job_title: "Software Engineer" } },
];
export const testimonials = [
    {
        name: "John Doe",
        text: "This platform helped me secure my dream job!",
        img: "img_1.png"
    },
    {
        name: "Jane Smith",
        text: "Super easy to apply for jobs and track my applications.",
        img: "img_2.png"
    }
];

export const animation = {
    x: ["0vw", "30vw", "20vw", "34vw", "10vw", "20vw"], // Moves left and right
    y: ["0vh", "20vh", "-30vh", "-40vh", "10vh", "23vh"],  // Moves up and down
    transition: {
        duration: 58,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
    },
};

export const languages = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "c", label: "C", monaco: "c" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "php", label: "PHP", monaco: "php" },
  { id: "kotlin", label: "Kotlin", monaco: "kotlin" },
  { id: "rust", label: "Rust", monaco: "rust" },
  { id: "go", label: "Go", monaco: "go" },
  { id: "dart", label: "Dart", monaco: "dart" },
  { id: "sql", label: "SQL", monaco: "sql" },
];

export const defaultCodeByLanguage = {
  javascript: `// JavaScript\nfunction greet(name) {\n  console.log(\`Hello, \${name}!\`);\n}\n\ngreet("World");`,
  typescript: `// TypeScript\nfunction greet(name: string): void {\n  console.log(\`Hello, \${name}!\`);\n}\n\ngreet("World");`,
  python: `# Python\ndef greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")`,
  java: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  c: `// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\n");\n    return 0;\n}`,
  cpp: `// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
  php: `<?php\n// PHP\nfunction greet($name) {\n    echo "Hello, $name!";\n}\n\ngreet("World");\n?>`,
  kotlin: `// Kotlin\nfun main() {\n    println("Hello, World!")\n}`,
  rust: `// Rust\nfn main() {\n    println!("Hello, World!");\n}`,
  go: `// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  dart: `// Dart\nvoid main() {\n  print('Hello, World!');\n}`,
  sql: `-- SQL\nSELECT 'Hello, World!' AS greeting;`,
};

export const predefinedQuestions = [
    { question: "Explain closures in JavaScript", code: "function outer() {\n  let counter = 0;\n  return function inner() {\n    counter++;\n    console.log(counter);\n  }\n}" },
    { question: "What is event delegation in JavaScript?", code: "// Explain concept of event bubbling and delegation" },
    { question: "Difference between var, let and const?", code: "var a = 10;\nlet b = 20;\nconst c = 30;" }
];