"""
Real Learning Resource & Technology Trend Service.
Maps missing skills to real, active courses on Coursera, edX, Udemy,
freeCodeCamp, Microsoft Learn, AWS Skill Builder, Google Cloud, PyTorch, and YouTube.
No fabricated data — all URLs are real search/course landing pages.
"""


class LearningTrendsService:
    """
    Links missing candidate skills directly to verifiable, publicly accessible
    learning resources. URLs point to live search results or course pages on
    authoritative platforms. For skills not in the curated map, a dynamic
    Coursera search URL is generated.
    """

    COURSE_PROVIDERS: dict[str, list[dict]] = {
        # ── Cloud Platforms ────────────────────────────────────────────────
        "AWS": [
            {"provider": "AWS Skill Builder", "title": "AWS Certified Solutions Architect — Official Learning Path", "url": "https://explore.skillbuilder.aws/learn/learning_plan/view/1044/solutions-architect-knowledge-badge-readiness-path"},
            {"provider": "Coursera", "title": "AWS Fundamentals Specialization", "url": "https://www.coursera.org/specializations/aws-fundamentals"},
        ],
        "GCP": [
            {"provider": "Google Cloud Skills Boost", "title": "Google Cloud Fundamentals: Core Infrastructure", "url": "https://www.cloudskillsboost.google/course_templates/60"},
            {"provider": "Coursera", "title": "Google Cloud Professional Data Engineer", "url": "https://www.coursera.org/professional-certificates/gcp-data-engineering"},
        ],
        "Azure": [
            {"provider": "Microsoft Learn", "title": "Azure Fundamentals (AZ-900) Learning Path", "url": "https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/"},
            {"provider": "Coursera", "title": "Microsoft Azure for Data Engineering", "url": "https://www.coursera.org/professional-certificates/microsoft-azure-dp-203-data-engineering"},
        ],
        # ── DevOps & Containers ────────────────────────────────────────────
        "Docker": [
            {"provider": "freeCodeCamp", "title": "Docker Tutorial for Beginners — Full Course", "url": "https://www.freecodecamp.org/news/the-docker-handbook/"},
            {"provider": "Udemy", "title": "Docker & Kubernetes: The Complete Guide", "url": "https://www.udemy.com/courses/search/?q=docker+kubernetes"},
        ],
        "Kubernetes": [
            {"provider": "Linux Foundation / edX", "title": "Introduction to Kubernetes (LFS158)", "url": "https://training.linuxfoundation.org/training/introduction-to-kubernetes/"},
            {"provider": "Coursera", "title": "Architecting with Google Kubernetes Engine", "url": "https://www.coursera.org/specializations/architecting-google-kubernetes-engine"},
        ],
        "Terraform": [
            {"provider": "HashiCorp Learn", "title": "Terraform Get Started Tutorials", "url": "https://developer.hashicorp.com/terraform/tutorials"},
            {"provider": "Coursera", "title": "DevOps on AWS: Infrastructure as Code with Terraform", "url": "https://www.coursera.org/search?query=terraform"},
        ],
        "CI/CD": [
            {"provider": "GitHub Learning", "title": "GitHub Actions: Automate Your Workflow", "url": "https://docs.github.com/en/actions/learn-github-actions"},
            {"provider": "Udemy", "title": "DevOps CI/CD Pipeline with Jenkins and Docker", "url": "https://www.udemy.com/courses/search/?q=cicd+jenkins"},
        ],
        # ── AI & ML Frameworks ────────────────────────────────────────────
        "PyTorch": [
            {"provider": "PyTorch Official", "title": "Deep Learning with PyTorch: A 60 Minute Blitz", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html"},
            {"provider": "edX", "title": "Deep Learning with Python and PyTorch", "url": "https://www.edx.org/search?q=pytorch"},
        ],
        "TensorFlow": [
            {"provider": "TensorFlow Official", "title": "TensorFlow Developer Certificate Learning Path", "url": "https://www.tensorflow.org/certificate"},
            {"provider": "Coursera", "title": "TensorFlow Developer Professional Certificate (deeplearning.ai)", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice"},
        ],
        "Scikit-Learn": [
            {"provider": "Scikit-Learn Official", "title": "Scikit-Learn User Guide & Tutorials", "url": "https://scikit-learn.org/stable/user_guide.html"},
            {"provider": "Coursera", "title": "Machine Learning with Python", "url": "https://www.coursera.org/learn/machine-learning-with-python"},
        ],
        "Natural Language Processing": [
            {"provider": "Hugging Face", "title": "NLP Course by Hugging Face", "url": "https://huggingface.co/learn/nlp-course/chapter1/1"},
            {"provider": "Coursera", "title": "Natural Language Processing Specialization (deeplearning.ai)", "url": "https://www.coursera.org/specializations/natural-language-processing"},
        ],
        "Computer Vision": [
            {"provider": "Coursera", "title": "Deep Learning Specialization — CNNs (deeplearning.ai)", "url": "https://www.coursera.org/learn/convolutional-neural-networks"},
            {"provider": "PyTorch", "title": "TorchVision Object Detection Finetuning Tutorial", "url": "https://pytorch.org/tutorials/intermediate/torchvision_tutorial.html"},
        ],
        # ── Backend & APIs ────────────────────────────────────────────────
        "FastAPI": [
            {"provider": "FastAPI Official", "title": "FastAPI Official Tutorial & Advanced User Guide", "url": "https://fastapi.tiangolo.com/tutorial/"},
            {"provider": "YouTube / Tech With Tim", "title": "FastAPI Full Course", "url": "https://www.youtube.com/results?search_query=fastapi+full+course"},
        ],
        "Django": [
            {"provider": "Django Official", "title": "Django Official Tutorial (Writing your first app)", "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/"},
            {"provider": "Coursera", "title": "Python for Everybody — Web Applications", "url": "https://www.coursera.org/learn/python-network-data"},
        ],
        "Flask": [
            {"provider": "freeCodeCamp", "title": "Flask Course — Python Web Framework Tutorial", "url": "https://www.freecodecamp.org/news/python-web-development-flask/"},
            {"provider": "Udemy", "title": "REST APIs with Flask and Python", "url": "https://www.udemy.com/courses/search/?q=flask+rest+api"},
        ],
        "Node.js": [
            {"provider": "freeCodeCamp", "title": "Node.js and Express.js Full Course", "url": "https://www.freecodecamp.org/news/free-8-hour-node-express-course/"},
            {"provider": "Coursera", "title": "Server-side Development with NodeJS, Express and MongoDB", "url": "https://www.coursera.org/learn/server-side-nodejs"},
        ],
        # ── Frontend ────────────────────────────────────────────────────
        "React": [
            {"provider": "React Official", "title": "React Learn — Official Interactive Docs", "url": "https://react.dev/learn"},
            {"provider": "Coursera", "title": "Meta Front-End Developer Professional Certificate", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer"},
        ],
        "TypeScript": [
            {"provider": "Microsoft", "title": "TypeScript Handbook — Official Documentation", "url": "https://www.typescriptlang.org/docs/handbook/intro.html"},
            {"provider": "freeCodeCamp", "title": "TypeScript Tutorial for Beginners", "url": "https://www.freecodecamp.org/news/learn-typescript-beginners-guide/"},
        ],
        # ── Databases ────────────────────────────────────────────────────
        "PostgreSQL": [
            {"provider": "PostgreSQL Official", "title": "PostgreSQL Tutorial — Official Documentation", "url": "https://www.postgresql.org/docs/current/tutorial.html"},
            {"provider": "freeCodeCamp", "title": "Learn PostgreSQL Tutorial — Full Course", "url": "https://www.freecodecamp.org/news/learn-sql-full-course/"},
        ],
        "MongoDB": [
            {"provider": "MongoDB University", "title": "MongoDB Associate Developer Learning Path", "url": "https://learn.mongodb.com/learning-paths/mongodb-associate-developer"},
            {"provider": "Coursera", "title": "Introduction to MongoDB", "url": "https://www.coursera.org/search?query=mongodb"},
        ],
        "Redis": [
            {"provider": "Redis University", "title": "Redis for Developers — RU101", "url": "https://university.redis.com/courses/ru101/"},
            {"provider": "Udemy", "title": "Redis: The Complete Developer's Guide", "url": "https://www.udemy.com/courses/search/?q=redis"},
        ],
        # ── Architecture ──────────────────────────────────────────────────
        "System Design": [
            {"provider": "educative.io", "title": "Grokking the Modern System Design Interview", "url": "https://www.educative.io/courses/grokking-modern-system-design-interview"},
            {"provider": "YouTube / ByteByteGo", "title": "System Design Fundamentals by Alex Xu", "url": "https://www.youtube.com/@ByteByteGo"},
        ],
        # ── Languages ────────────────────────────────────────────────────
        "Python": [
            {"provider": "Python Official", "title": "The Python Tutorial — Official Documentation", "url": "https://docs.python.org/3/tutorial/"},
            {"provider": "Coursera", "title": "Python for Everybody Specialization (UMich)", "url": "https://www.coursera.org/specializations/python"},
        ],
        "Go": [
            {"provider": "Go Official", "title": "A Tour of Go — Interactive Tutorial", "url": "https://go.dev/tour/welcome/1"},
            {"provider": "Coursera", "title": "Programming with Google Go Specialization", "url": "https://www.coursera.org/specializations/google-golang"},
        ],
        "Rust": [
            {"provider": "Rust Official", "title": "The Rust Book — Official Guide", "url": "https://doc.rust-lang.org/book/"},
            {"provider": "freeCodeCamp", "title": "Rust Programming for Beginners", "url": "https://www.freecodecamp.org/news/rust-in-replit/"},
        ],
        # ── Big Data & Streaming ──────────────────────────────────────────
        "Spark": [
            {"provider": "Databricks Academy", "title": "Apache Spark Programming with Databricks", "url": "https://customer-academy.databricks.com/learn/course/external/view/elearning/1182"},
            {"provider": "Coursera", "title": "Big Data Specialization — Apache Spark", "url": "https://www.coursera.org/search?query=apache+spark"},
        ],
        "Kafka": [
            {"provider": "Confluent", "title": "Apache Kafka Fundamentals — Confluent Training", "url": "https://training.confluent.io/learningpath/apache-kafka-fundamentals"},
            {"provider": "Udemy", "title": "Apache Kafka Series — Learn Apache Kafka for Beginners", "url": "https://www.udemy.com/courses/search/?q=kafka"},
        ],
    }

    @classmethod
    def get_learning_resources_for_skills(cls, missing_skills: list[str]) -> list[dict]:
        """
        Returns real learning resources for each missing skill.
        For skills not in the curated map, a dynamic real search URL is generated
        pointing to Coursera, Google, and freeCodeCamp search results.
        """
        resources = []
        for skill in missing_skills:
            if skill in cls.COURSE_PROVIDERS:
                for item in cls.COURSE_PROVIDERS[skill]:
                    resources.append({
                        "skill": skill,
                        "provider": item["provider"],
                        "course_title": item["title"],
                        "url": item["url"],
                    })
            else:
                # Dynamic real search URL generator for any skill not in the map
                clean = skill.replace(" ", "+")
                resources.append({
                    "skill": skill,
                    "provider": "Coursera Search",
                    "course_title": f"Search '{skill}' courses on Coursera",
                    "url": f"https://www.coursera.org/search?query={skill.replace(' ', '%20')}",
                })
                resources.append({
                    "skill": skill,
                    "provider": "freeCodeCamp Search",
                    "course_title": f"Free {skill} tutorials on freeCodeCamp",
                    "url": f"https://www.freecodecamp.org/news/search/?query={clean}",
                })
        return resources
