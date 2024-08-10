const express = require('express');
const cors = require('cors');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const webpush = require('web-push');

const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000", "https://665b4e406690d57758cfba74--lively-sunburst-75cde3.netlify.app",
            "https://6664c030dadd5026bffe0726--dapper-kleicha-1ac05b.netlify.app",
            "https://66437d7bd54dad360e3ff903--endearing-raindrop-27488f.netlify.app",
            "https://666a55504b9a6570ed7a9caf--spiffy-pixie-2cf7ee.netlify.app"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}))

const db = require('./models/config')
db.sequelize.authenticate()
    .then(() => {
        console.log('Успешное подключение к базе данных!');
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных:', err);
    });

const TheoryChapter = db.theoryChapter
const TheoryContent = db.theoryContent
const TheoryChapterContent = db.theoryChapterContent
const Meditation = db.meditation
const Card = db.card
const User = db.user
const UserCard = db.userCard
const UserMood = db.userMood

const Location = db.location
const VegSymp = db.vegSymp
const PsySymp = db.psySymp

const PA = db.panicAttacks
const UserPA = db.userPanicAttacks
const PAVeg = db.panicAttackVegSymp
const PAPsy = db.panicAttackPsySymp
const PACard = db.panicAttackCard

const RefreshToken = db.refreshToken
const Subscriptions = db.subscriptions

const PORT = process.env.PORT || 8800;
app.get('/', (req, res) => {
    res.send('hello');
});

app.get("/meditation", async (req, res) => {
    try {
        const meditation = await Meditation.findAll({
            order: [
                ['meditation_id', 'ASC']
            ]
        });
        res.json(meditation);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch theory chapters'
        });
    }
});
app.get("/theoryChapters", async (req, res) => {
    try {
        const theoryChapters = await TheoryChapter.findAll({
            order: [
                ['theory_chapter_id', 'ASC']
            ]
        });
        res.json(theoryChapters);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch theory chapters'
        });
    }
});

app.get("/theory/:theory_chapter_id", async (req, res) => {
    try {
        const theoryChapterId = req.params.theory_chapter_id;
        const theoryContent = await TheoryChapterContent.findAll({
            where: {
                theory_chapter_id: theoryChapterId
            },
            include: [{
                model: TheoryChapter,
                attributes: ['name'],
                required: true
            }, {
                model: TheoryContent,
                attributes: ['theory_content_id', 'title', 'content'],
                required: true
            }]
        });
        const formattedContent = {
            name: theoryContent.length > 0 ? theoryContent[0].TheoryChapter.name : null,
            theoryContent: theoryContent.map(item => item.TheoryContent.dataValues)
        };
        res.json(formattedContent);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch theory content'
        });
    }
});

const checkAdmin = (req) => {
    const token = req.headers.authorization;
    if (!token) {
        return {
            admin: false,
            status: 401,
            error: 'Токен не найден'
        };
    }
    const decodedToken = jwt.verify(token, 'your_secret_key');
    const role = decodedToken.role;
    if (role != 100) {
        return {
            admin: false,
            status: 403,
            error: 'У вас нет прав на совершение этой операции'
        };
    }
    return {
        admin: true
    }
};

app.put("/theory/put/:chapter_id", async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        const { chapter_id } = req.params;
        const { name } = req.body;
        const chapter = await TheoryChapter.findByPk(chapter_id);
        if (!chapter) {
            return res.status(404).json({
                error: "Раздел не найден"
            });
        }
        chapter.name = name; // Обновление названия раздела
        await chapter.save();
        return res.status(200).json(chapter);
    } catch (error) {
        console.error("Ошибка при обновлении карточки:", error);
        return res.status(500).json({
            error: error
        });
    }
});

app.post('/theory/add', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { name } = req.body;
            await TheoryChapter.create({ name });
            res.status(200).send({
                message: 'Раздел успешно добавлен'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при добавлении раздела:', error);
            }

        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.delete('/theory/delete/:chapter_id', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { chapter_id } = req.params;
            const deletedChapter = await TheoryChapter.destroy({
                where: {
                    theory_chapter_id: chapter_id
                }
            });

            if (deletedChapter) {
                res.status(200).send("Раздел успешно удалён");
            } else {
                res.status(404).send("Раздел не найден");
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при удалении раздела:', error);
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.put("/theory-content/put/:content_id", async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        const { content_id } = req.params;
        const { title, content } = req.body;
        const contentItem = await TheoryContent.findByPk(content_id);

        if (!contentItem) {
            return res.status(404).json({
                error: "Блок контента не найден"
            });
        }
        contentItem.title = title;
        contentItem.content = content;
        await contentItem.save();
        return res.status(200).json(contentItem);
    } catch (error) {
        console.error("Ошибка при обновлении контента:", error);
        return res.status(500).json({
            error: error
        });
    }
});
app.post('/theory-content/add', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { title, content, chapterID } = req.body;
            const contentItem = await TheoryContent.create({ title, content });
            await TheoryChapterContent.create({
                theory_chapter_id: chapterID,
                theory_content_id: contentItem.theory_content_id
            });
            res.status(200).send({
                message: 'Контент успешно добавлен'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при добавлении контента:', error);
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.delete('/theory-content/delete/:content_id', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { content_id } = req.params;
            const deletedContent = await TheoryContent.destroy({
                where: {
                    theory_content_id: content_id
                }
            });

            if (deletedContent) {
                res.status(200).send("Коннтент успешно удалён");
            } else {
                res.status(404).send("Контент не найден");
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при удалении контента:', error);
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get("/cards", async (req, res) => {
    try {
        const cards = await Card.findAll({
            where: {
                type: 0
            }
        });
        res.json(cards);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch theory content'
        });
    }
});

app.get('/cards/personal', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }

        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;
            const userCards = await UserCard.findAll({
                where: {
                    user_id: userId
                },
                include: [{
                    model: Card,
                    attributes: ['card_id', 'content', 'type'],
                    required: true
                }]
            });
            const cards = userCards.map(userCard => userCard.Card)
            res.json(cards);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                // Обработка ошибки при расшифровке токена или другой ошибки в процессе добавления карточки
                console.error('Ошибка при чтении персональных карточек: ', error);
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.put("/card/put/:card_id", async (req, res) => {
    const { card_id } = req.params; 
    const { content } = req.body; 

    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const card = await Card.findByPk(card_id);

        if (!card) {
            return res.status(404).json({
                error: "Карточка не найдена"
            });
        }
        if (card.type === 0) {
            const check = checkAdmin(req);
            if (!check.admin) {
                return res.status(check.status).send(check.error);
            }
        } else {
            // Поиск записи в таблице UserCard, связывающую карточку и текущего пользователя
            const userCard = await UserCard.findOne({
                where: {
                    card_id,
                    user_id: userId
                }
            });
            if (!userCard) {
                return res.status(403).json({
                    error: "У вас нет прав на изменение этой карточки"
                });
            }
        }
        card.content = content;
        await card.save();
        return res.status(200).json(card);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).send({
                error: 'Срок действия токена истёк'
            });
        } else {
            console.error('Ошибка при обновлении записи о настроении:', error);
            res.status(500).send({
                error: 'Произошла ошибка при обновлении записи о настроении'
            });
        }
    }
});

app.delete('/card/delete/:card_id', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const type = req.headers.type;

        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const { card_id } = req.params;

            if (type == 0) {
                const check = checkAdmin(req);
                if (!check.admin) {
                    return res.status(check.status).send(check.error);
                }
            } else {
                const userId = decodedToken.userId;
                const userCard = await UserCard.findOne({
                    where: {
                        card_id,
                        user_id: userId
                    }
                });
                const cardFound = await Card.findOne({
                    where: {
                        card_id
                    }
                });
                if (!cardFound) {
                    return res.status(403).json({
                        error: "Карточки с таким идентификатором не существует"
                    });
                } else if (!userCard) {
                    return res.status(403).json({
                        error: "У вас нет прав на изменение этой карточки"
                    });
                }
            }
            const deletedCard = await Card.destroy({
                where: {
                    card_id: card_id
                }
            });

            if (deletedCard) {
                res.status(200).send("Карточка успешно удалена");
            } else {
                res.status(404).send("Карточка не найдена");
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при удалении карточки:', error);
            }

        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.post('/card/add', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const type = req.headers.type;

        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;
            const { content } = req.body;
            if (type == 0) {
                const check = checkAdmin(req);
                if (!check.admin) {
                    return res.status(check.status).send(check.error);
                }
                await Card.create({
                    content: content,
                    type: 0
                })
            } else {
                const newCard = await Card.create({
                    content
                });
                await UserCard.create({
                    user_id: userId,
                    card_id: newCard.card_id
                });
            }

            res.status(200).send({
                message: 'Карточка успешно добавлена'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при добавлении карточки:', error);
            }

        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get('/user-mood', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }

        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;
            const userMoods = await UserMood.findAll({
                where: {
                    user_id: userId
                },
                attributes: ['date', 'mood', 'notes'],
                order: [
                    ['date', 'DESC'] 
                ]
            }, );

            res.json(userMoods);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.log('Ошибка при получении информации о настроениях:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при получении информации о настроениях'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get('/mood/check-today-entry', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }

        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;

            const date = new Date(); 
            const year = date.getFullYear(); 
            const month = date.getMonth(); 
            const day = date.getDate(); 
            // Создание объекта Date с часами, минутами и секундами установленными на полночь по UTC
            const today = new Date(Date.UTC(year, month, day, 0, 0, 0)); 
            
            // Проверка наличия записи о настроении для сегодняшней даты
            const todayEntry = await UserMood.findOne({
                where: {
                    user_id: userId,
                    date: today
                }
            });
            console.log(todayEntry);
            if (todayEntry) {
                // При наличии записи возвращается mood и notes
                res.status(200).send({
                    exists: true,
                    mood: todayEntry.mood,
                    notes: todayEntry.notes
                });
            } else {
                // При отсутствии записи возвращается флаг exists
                res.status(200).send({
                    exists: false
                });
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при проверке записи о настроении:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при проверке записи о настроении'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.post('/mood/add', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }

        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;
            const { mood, notes } = req.body;

            const date = new Date(); 
            const year = date.getFullYear(); 
            const month = date.getMonth();
            const day = date.getDate();
            const formattedDate = new Date(Date.UTC(year, month, day, 0, 0, 0)); 
            await UserMood.create({
                user_id: userId,
                date: formattedDate,
                mood,
                notes
            });

            res.status(200).send({
                message: 'Запись о настроении успешно добавлена'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при добавлении записи о настроении:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при добавлении записи о настроении'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.put('/mood/edit', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }

        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;

            const { mood, notes } = req.body;
            const date = new Date(); 
            const year = date.getFullYear(); 
            const month = date.getMonth();  
            const day = date.getDate();  
            const formattedDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

            // Поиск записи о настроении пользователя на сегодняшнюю дату
            const existingRecord = await UserMood.findOne({
                where: {
                    user_id: userId,
                    date: formattedDate
                }
            });
            // При существовании записи происходит её обновление 
            if (existingRecord) {
                existingRecord.mood = mood;
                existingRecord.notes = notes;
                await existingRecord.save();
                res.status(200).send({
                    message: 'Запись о настроении успешно обновлена'
                });
            } else {
            // При остутствии записи происходит её добавление 
                await UserMood.create({
                    user_id: userId,
                    date: formattedDate,
                    mood,
                    notes
                });
                res.status(200).send({
                    message: 'Запись о настроении успешно добавлена'
                });
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при обновлении записи о настроении:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при обновлении записи о настроении'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

const { Op } = require('sequelize');
app.get('/mood/statistics/all', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        try {
            const moodData = await UserMood.findAll({
                where: {
                    user_id: userId
                }
            });
            if (moodData.length === 0) {
                return res.sendStatus(204)
            } else {
                res.status(200).json({
                    moodData
                });
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при получении данных о настроении:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при получении данных о настроении'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get('/mood/statistics/current_month', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        try {

            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const day = today.getDate(); 
            const endDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
            const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
            startDate.setDate(1);
            const moodData = await UserMood.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    }
                }
            });
            if (moodData.length === 0) {
                return res.sendStatus(204)
            } else {
                res.status(200).json({
                    moodData
                });
            }

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при получении данных о настроении:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при получении данных о настроении'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

function getAdjustedDayOfWeek(day) {
    switch (day) {
        case 0: // Воскресенье
            return 7;
        case 1: // Понедельник
            return 1;
        case 2: // Вторник
            return 2;
        case 3: // Среда
            return 3;
        case 4: // Четверг
            return 4;
        case 5: // Пятница
            return 5;
        case 6: // Суббота
            return 6;
        default:
            return -1; // Если произошла ошибка
    }
}
app.get('/mood/statistics/current_week', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        try {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - getAdjustedDayOfWeek(today.getDay()) - 1);
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - getAdjustedDayOfWeek(today.getDay())));
            const moodData = await UserMood.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.gte]: startOfWeek,
                        [Op.lte]: endOfWeek
                    }
                }
            });
            if (moodData.length === 0) {
                return res.sendStatus(204)
            } else {
                res.status(200).json({
                    moodData
                });
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при получении данных о настроении:', error);
                res.status(500).send({
                    error: 'Произошла ошибка при получении данных о настроении'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});
app.get('/panic-attacks', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;
            const userPanicAttacks = await UserPA.findAll({
                where: {
                    user_id: userId
                },
                include: [{
                    model: PA
                }],
                order: [
                    [{ model: PA }, 'date', 'DESC']
                ]
            });

            const pa = userPanicAttacks.map(userPanicAttack =>
                userPanicAttack.PanicAttack)
            res.status(200).send(pa);

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при получении записей о панических атаках: ', error);
                res.status(500).send({
                    error: error.name
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get('/locations', async (req, res) => {
    try {
        const locations = await Location.findAll({
            attributes: ['location_id', 'name']
        });
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.get('/veg-symps', async (req, res) => {
    try {
        const vegSymps = await VegSymp.findAll({
            attributes: ['vegetative_symptom_id', 'description']
        });
        res.json(vegSymps);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.get('/psy-symps', async (req, res) => {
    try {
        const psySymps = await PsySymp.findAll({
            attributes: ['psycho_symptom_id', 'description']
        });
        res.json(psySymps);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.get('/pa/veg-symps', async (req, res) => {
    try {
        const PAId = req.headers.pa_id;
        const vegetative = await PAVeg.findAll({
            where: { panic_attack_id: PAId },
            include: { model: VegSymp }
        });
        const symptoms = vegetative.map(data => data.VegetativeSymptom)
        res.json(symptoms);
    } catch (error) {
        console.error('Error fetching vegetative symptoms:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.get('/pa/psy-symps', async (req, res) => {
    try {
        const PAId = req.headers.pa_id;
        const psy = await PAPsy.findAll({
            where: { panic_attack_id: PAId },
            include: { model: PsySymp } 
        });
        const symptoms = psy.map(data => data.PsychoSymptom)
        res.json(symptoms);
    } catch (error) {
        console.error('Error fetching vegetative symptoms:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.get('/pa/cards', async (req, res) => {
    try {
        const PAId = req.headers.pa_id;
        const cards = await PACard.findAll({
            where: { panic_attack_id: PAId },
            include: { model: Card }
        });
        const cardsPA = cards.map(data => data.Card)
        res.json(cardsPA);
    } catch (error) {
        console.error('Error fetching vegetative symptoms:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

app.post('/pa-save', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;

            const {
                date,
                time,
                duration,
                severity,
                location,
                location_details,
                triggers
            } = req.body
            const newPA = await PA.create({
                date,
                time,
                duration,
                severity,
                location,
                location_details,
                triggers
            });
            // Получение идентификатора только что добавленной записи
            const PAId = newPA.panic_attack_id;
            // Создание записи в таблице, связывающей пользователя и паническую атаку
            await UserPA.create({
                user_id: userId,
                panic_attack_id: PAId
            })

            const vegetative = req.body.vegetative;
            for (const symp of vegetative) {
                await PAVeg.create({
                    panic_attack_id: PAId,
                    vegetative_symptom_id: symp
                })
            }

            const psy = req.body.psycho;
            for (const symp of psy) {
                await PAPsy.create({
                    panic_attack_id: PAId,
                    psycho_symptom_id: symp
                })
            }

            const cards = req.body.cards;
            for (const card of cards) {
                await PACard.create({ panic_attack_id: PAId, card_id: card })
            }
            res.status(200).send({
                message: 'Запись о панической атаке успешно добавлена'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при добавлении записи о панической атаке: ', error);
                res.status(500).send({
                    error: error.name
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

const sequelize = require('sequelize');
app.get('/pa/statistics/:period', async (req, res) => {
    let startDate = new Date();
    let endDate = new Date();
    let panicAttackIds;
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;
            const period = req.params.period;
            if (period === 'current_month') {
                const today = new Date();
                const year = today.getFullYear(); 
                const month = today.getMonth(); 
                const day = today.getDate();
                // startDate и endDate - даты начала и конца периода
                endDate = new Date(Date.UTC(year, month, day, 23, 59, 59));
                startDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
                startDate.setDate(1); // Установка начальной даты текущего месяца

                const panicAttacks = await UserPA.findAll({
                    where: { user_id: userId },
                    attributes: ['panic_attack_id'],
                    include: [{
                        model: PA,
                        where: {
                            date: {
                                [Op.gte]: startDate,
                                [Op.lte]: endDate
                            }
                        } 
                    }]
                });
                // Извлечение идентификаторов панических атак в массив
                panicAttackIds = panicAttacks.map(attack => attack.panic_attack_id);
            } else if (period === 'current_week') {

                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - getAdjustedDayOfWeek(today.getDay()) - 1);
                const endDate = new Date(today);
                endDate.setDate(today.getDate() + (7 - getAdjustedDayOfWeek(today.getDay())));

                const panicAttacks = await UserPA.findAll({
                    where: { user_id: userId },
                    attributes: ['panic_attack_id'],
                    include: [{
                        model: PA,
                        where: {
                            date: {
                                [Op.gte]: startDate,
                                [Op.lte]: endDate
                            }
                        }
                    }]
                });
                panicAttackIds = panicAttacks.map(attack => attack.panic_attack_id);

            } else {
                const panicAttacks = await UserPA.findAll({
                    where: {
                        user_id: userId
                    },
                    attributes: ['panic_attack_id']
                });

                panicAttackIds = panicAttacks.map(attack => attack.panic_attack_id);
            }
            if (panicAttackIds.length === 0) {
                console.log('пусто')
                return res.sendStatus(204)
            }
            // Получение общей статистики по паническим атакам
            const PAstatistics = await PA.findAndCountAll({
                where: { panic_attack_id: panicAttackIds },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('panic_attack_id')), 'total_attacks'],
                    [sequelize.fn('DATE_FORMAT', sequelize.fn('SEC_TO_TIME', sequelize.fn('AVG', sequelize.fn('TIME_TO_SEC', sequelize.col('duration')))), '%H:%i:%s'),
                        'average_duration'
                    ],
                    [sequelize.fn('AVG', sequelize.col('severity')), 'average_severity']
                ]
            });
            const total_attacks = PAstatistics.rows[0].dataValues.total_attacks;
            const avgSeverity = PAstatistics.rows[0].dataValues.average_severity;
            const avgDuration = PAstatistics.rows[0].dataValues.average_duration;

            // Получение наиболее частого места
            const mostCommonLocation = await PA.findOne({
                where: { panic_attack_id: panicAttackIds },
                attributes: ['location', [sequelize.fn('COUNT', sequelize.col('location')), 'count']],
                group: ['location'],
                order: [
                    [sequelize.literal('count'), 'DESC']
                ],
                limit: 1
            });
            // Использование массива идентификатора для фильтрации записей в таблицах PAVegSymp и PAPsySymp
            const mostCommonVegSymptoms = await PAVeg.findAll({
                where: { panic_attack_id: panicAttackIds },
                attributes: ['vegetative_symptom_id', [sequelize.fn('COUNT', sequelize.col('PanicAttackVegSymp.vegetative_symptom_id')), 'count']],
                group: ['PanicAttackVegSymp.vegetative_symptom_id'],
                order: [
                    [sequelize.literal('count'), 'DESC']
                ],
                limit: 2,
                include: [{
                    model: VegSymp
                }]
            });

            // Получение наиболее часто встречающихся психосоматических симптомов
            const mostCommonPsySymptoms = await PAPsy.findAll({
                where: { panic_attack_id: panicAttackIds },
                attributes: ['psycho_symptom_id', [sequelize.fn('COUNT', sequelize.col('PanicAttackPsySymp.psycho_symptom_id')), 'count']],
                group: ['PanicAttackPsySymp.psycho_symptom_id'],
                order: [
                    [sequelize.literal('count'), 'DESC']
                ],
                limit: 2,
                include: [{
                    model: PsySymp
                }]
            });

            const mostCommonVegSymptomsData = mostCommonVegSymptoms.map(symptom => ({
                vegetative_symptom_id: symptom.vegetative_symptom_id,
                count: symptom.dataValues.count
            }));
            const mostCommonPsySymptomsData = mostCommonPsySymptoms.map(symptom => ({
                psycho_symptom_id: symptom.psycho_symptom_id,
                count: symptom.dataValues.count
            }));


            res.status(200).json({
                total_attacks: total_attacks,
                avgDuration: avgDuration,
                avgSeverity: parseInt(avgSeverity),
                mostCommonLocation,
                mostCommonVegSymptoms: mostCommonVegSymptomsData,
                mostCommonPsySymptoms: mostCommonPsySymptomsData
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            } else {
                console.error('Ошибка при получении статистики о панических атаках: ', error);
                res.status(500).send({
                    error: error.name
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});


const salt = 10;

app.post('/register', (req, res) => {
    const {
        email,
        password
    } = req.body;
    // Проверка существования пользователя, зарегистрированного по такому email
    User.findOne({
            where: { email }
        })
        .then(existingUser => {
            if (existingUser) {
                // Отправка сообщения в случае, если email занят
                return res.status(400).send({
                    message: "Email уже зарегистрирован"
                });
            }

            // Хеширование пароля и создание нового пользователя
            bcrypt.hash(password.toString(), salt, (err, hash) => {
                if (err) return res.status(500).send({
                    Error: "Ошибка при хешировании пароля"
                });

                User.create({
                        email,
                        password: hash
                    })
                    .then(newUser => {
                        res.status(200).send(newUser);
                    })
                    .catch(error => {
                        res.status(500).send(error);
                    });
            });
        })
        .catch(error => {
            res.status(500).send(error);
        });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({
            where: { email }
        })
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "Пользователь с указанным email не найден"
                });
            }

            bcrypt.compare(password.toString(), user.password, (err, result) => {
                if (err || !result) {
                    return res.status(401).json({
                        message: "Неправильный пароль"
                    });
                }

                const token = jwt.sign({
                    userId: user.user_id,
                    email: user.email,
                    role: user.role
                }, 'your_secret_key', { expiresIn: '8h' });
                const refreshToken = jwt.sign({
                    userId: user.user_id
                }, 'your_refresh_secret_key', { expiresIn: '7d' });
                RefreshToken.findOne({
                        where: {  user_id: user.user_id }
                    })
                    .then(existingToken => {
                        if (existingToken) {
                            // Обновление существующего refresh токена
                            existingToken.update({
                                    refresh_token: refreshToken,
                                    // Время жизни refresh токена - неделя
                                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                })
                                .then(() => {
                                    res.status(200).json({
                                        refreshToken: refreshToken,
                                        token: token,
                                        message: "Вы успешно вошли в систему"
                                    });
                                })
                                .catch(error => {
                                    res.status(500).json({
                                        message: "Ошибка обновления токена"
                                    });
                                });
                        } else {
                            // Создание нового refresh токена для пользователя при авторизации
                            RefreshToken.create({
                                    refresh_token: refreshToken,
                                    user_id: user.user_id,
                                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                })
                                .then(() => {
                                    res.status(200).json({
                                        refreshToken: refreshToken,
                                        token: token,
                                        message: "Вы успешно вошли в систему"
                                    });
                                })
                                .catch(error => {
                                    res.status(500).json({
                                        message: "Ошибка создания токена"
                                    });
                                });
                        }
                    })
                    .catch(error => {
                        res.status(500).json({
                            message: "Ошибка проверки токена"
                        })
                    });
            });
        })
        .catch(error => {
            console.error("Ошибка при поиске пользователя:", error);
            res.status(500).json({
                message: "Произошла ошибка при попытке входа"
            });
        });
});

app.get('/role', (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                error: 'Токен не найден'
            });
        }
        try {
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const role = decodedToken.role;
            res.status(200).json({
                role: role
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).send({
                    error: 'Срок действия токена истёк'
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при получении роли:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get("/users", async (req, res) => {
  try {
    const check = checkAdmin(req);
    if(!check.admin){
      return res.status(check.status).send(check.error);
    }
    try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'your_secret_key');
    const userId = decodedToken.userId;
    const users = await User.findAll({
      where: {
        user_id: {
          [Op.ne]: userId 
        }
      }});
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
  }
} catch (error) {
  console.error('Ошибка при обработке запроса:', error);
  res.status(500).send({ error: 'Произошла ошибка при обработке запроса' });
}
});

app.put('/user/put/:user_id', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { user_id } = req.params;
            const { userRole: role } = req.body;
            const user = await User.findByPk(user_id);
            user.role = role;
            await user.save();
            return res.status(200).json(user);
        } catch (error) {
            console.error('Ошибка при обновлении роли пользователя:', error);
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.post('/user/add', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { email: email } = req.body;
            const { password: password } = req.body;
            const { role: role } = req.body;
            bcrypt.hash(password.toString(), salt, async (err, hash) => {
                if (err) {
                    console.error('Ошибка хеширования пароля:', err);
                    return res.status(500).json({
                        error: 'Ошибка сервера'
                    });
                }
                try {
                    const user = await User.create({
                        email: email,
                        password: hash,
                        role: role
                    });
                    return res.status(201).json(user);
                } catch (error) {
                    console.error('Ошибка при создании пользователя:', error);
                    return res.status(500).json({
                        error: 'Ошибка сервера'
                    });
                }
            });
        } catch (error) {
            console.error('Ошибка при обновлении роли пользователя:', error);
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.delete('/user/delete/:user_id', async (req, res) => {
    try {
        const check = checkAdmin(req);
        if (!check.admin) {
            return res.status(check.status).send(check.error);
        }
        try {
            const { user_id } = req.params;
            const deletedUser = await User.destroy({
                where: { user_id: user_id }
            });
            return res.status(201).json(deletedUser);
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            error: 'Произошла ошибка при обработке запроса'
        });
    }
});

app.get('/checkAuth', (req, res) => {
    // Извлечение основного токена и refresh токена из заголовков
    const token = req.headers.authorization;
    const refreshToken = req.headers['x-refresh-token'];
    if (token) {
        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) {
                if (!refreshToken) {
                    return res.status(401).json({
                        message: "Токен отсутствует",
                        isAuthenticated: false,
                        userId: null
                    });
                }
                // Проверка refresh токена
                jwt.verify(refreshToken, 'your_refresh_secret_key', (err, refreshDecoded) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Недействительный refresh токен",
                            isAuthenticated: false,
                            userId: null
                        });
                    }
                    console.log('проверка refresh')
                    // Поиск refresh токена в базе данных
                    RefreshToken.findOne({
                            where: { refresh_token: refreshToken }
                        })
                        .then(foundToken => {

                            if (!foundToken || new Date() > foundToken.expiresAt) {
                                return res.status(401).json({
                                    message: "Refresh токен не найден или истек",
                                    isAuthenticated: false,
                                    userId: null
                                });
                            }
                            User.findByPk(foundToken.user_id)
                                .then(user => {
                                    if (!user) {
                                        return res.status(404).json({
                                            message: "Пользователь не найден",
                                            isAuthenticated: false,
                                            userId: null
                                        });
                                    }
                                    // Удаление текущего refresh токена из базы данных
                                    return foundToken.destroy()
                                        .then(() => {
                                            // Создание новой пары токенов
                                            const newAccessToken = jwt.sign({
                                                userId: user.user_id,
                                                email: user.email,
                                                role: user.role
                                            }, 'your_secret_key', { expiresIn: '1m' });
                                            const newRefreshToken = jwt.sign({
                                                userId: user.user_id,
                                                email: user.email,
                                                role: user.role
                                            }, 'your_refresh_secret_key', { expiresIn: '7d'});

                                            // Обновление refresh токена в базе данных
                                            RefreshToken.create({
                                                    refresh_token: newRefreshToken,
                                                    user_id: user.user_id,
                                                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                })
                                                .then(() => {
                                                    res.status(200).json({
                                                        isAuthenticated: true,
                                                        userId: user.user_id,
                                                        token: newAccessToken,
                                                        refreshToken: newRefreshToken
                                                    });
                                                });
                                        });
                                })
                                .catch(err => {
                                    console.error(err);
                                    res.status(500).json({
                                        message: "Ошибка сервера",
                                        isAuthenticated: false,
                                        userId: null
                                    });
                                });
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(500).json({
                                message: "Ошибка сервера",
                                isAuthenticated: false,
                                userId: null
                            });
                        });
                });
            } else {
                res.status(200).json({
                    isAuthenticated: true,
                    userId: decoded.userId
                });
            }
        });
    } else {
        return res.status(401).json({
            message: "Токен отсутствует",
            isAuthenticated: false,
            userId: null
        });
    }
});


app.delete('/logout', async (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];
    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh токен отсутствует"
        });
    }

    try {
        const tokenRecord = await RefreshToken.findOne({
            where: { refresh_token: refreshToken }
        });
        if (!tokenRecord) {
            return res.status(404).json({
                message: "Refresh токен не найден"
            });
        }
        // Удаление refresh токена из базы данных
        await tokenRecord.destroy();
        return res.status(200).json({
            message: "До свидания!"
        });
    } catch (error) {
        console.error("Ошибка при удалении refresh токена:", error);
        return res.status(500).json({
            message: "Ошибка сервера при удалении refresh токена"
        });
    }
});

const apiKeys = {
    publicKey: "BL-URrhm81GjTo8D91-qqRnTnEJ5DFIhcM9R5cjOUTqmtdPEbygsYZlmq2zk8wZK08pzOaTWDRskAzwmiEPe9a4",
    privateKey: "MlHeqAh_RtrtKMojU0ySgYjAJ2KgNzGyk1KWMAzQx-I"
}

webpush.setVapidDetails(
    'mailto:mail@example.com',
    apiKeys.publicKey,
    apiKeys.privateKey
)

app.post("/save-subscription", async (req, res) => {
    try {
        const { subscription, timezone } = req.body;
        const { endpoint, keys } = req.body.subscription;
        const { p256dh, auth } = keys;

        const newSubscription = await Subscriptions.create({
            endpoint,
            auth,
            p256dh,
            timezone
        });

        res.json({
            status: "Success",
            message: "Subscription saved!",
            subscription: newSubscription
        });
    } catch (error) {
        console.error('Ошибка при сохранении подписки:', error);
        res.status(500).json({
            status: "Error",
            message: "Failed to save subscription"
        });
    }
});

const notificationPayload = {
    title: "Как вы себя чувствуете?",
    body: "Не забудьте заполнить дневник настроения! 🤍",
    icon: "./pahandle.png" 
};
app.get("/send-notification", async (req, res) => {
    try {
        const subscriptions = await Subscriptions.findAll(); // Все подписки из базы данных

        // Отправка уведомления для каждой подписки
        for (const subscription of subscriptions) {
            const subscriptionObject = {
                endpoint: subscription.endpoint,
                expirationTime: null,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
                }
            };

            await webpush.sendNotification(subscriptionObject, JSON.stringify(notificationPayload));
        }
        res.status(200).json({
            message: "Уведомления отправлены"
        });
    } catch (error) {
        console.error("Ошибка при отправке уведомлений:", error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

app.put('/update-reminder-status', async (req, res) => {
    const { userId } = req.body;
    console.log(userId)
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден"
            });
        }

        user.seen_reminder = true;
        await user.save();

        res.status(200).json({
            message: "Статус обновлен", seen: user.seen_reminder
        });
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

app.get("/seen/:user_id", async (req, res) => {
    try {
        const {
            user_id
        } = req.params;
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден"
            });
        }

        // Подсчёт существующих записей о настроении пользователя
        const moodRecordsCount = await UserMood.count({
            where: { user_id }
        });

        // Определить значение для флага seen_reminder
        const seenReminder = moodRecordsCount === 1 ? user.seen_reminder : true;

        res.status(200).json({
            seen: seenReminder
        });
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({
            message: "Ошибка сервера"
        });
    }
});

// //Функция отправки уведомлений 
// async function sendNotificationToSubscription(subscription) {
//     const subscriptionId = subscription.subscription_id;
//     const subscriptionObject = {
//         endpoint: subscription.endpoint,
//         expirationTime: null,
//         keys: {
//             p256dh: subscription.p256dh,
//             auth: subscription.auth
//         }
//     };

//     try {
//         await webpush.sendNotification(subscriptionObject, JSON.stringify(notificationPayload));
//     } catch (error) {
//         const statusCode = error.statusCode || (error.response && error.response.statusCode);
//         if (statusCode === 410) {
//             console.log(`Subscription has expired or is no longer valid: ${subscription.endpoint}`);
//             await Subscriptions.destroy({
//                 where: {
//                     subscription_id: subscriptionId
//                 }
//             });
//             console.error("Удалена подписка: ", subscriptionId);
//         } else {
//             console.error("Ошибка при отправке уведомления:", error);
//             await Subscriptions.destroy({
//                 where: {
//                     subscription_id: subscriptionId
//                 }
//             });
//             console.error("Удалена подписка: ", subscriptionId);
//         }
//     }
// }
//Функция отправки уведомлений 
//Функция отправки уведомлений 
async function sendNotificationToSubscription(subscription) {
    const subscriptionId = subscription.subscription_id
    const subscriptionObject = {
        endpoint: subscription.endpoint,
        expirationTime: null,
        keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
        }
    };

    try {
        await webpush.sendNotification(subscriptionObject, JSON.stringify(notificationPayload));
        console.log('отправлено ', subscriptionId)
    } catch (error) {
        const statusCode = error.statusCode || (error.response && error.response.statusCode);
        if (statusCode === 410) {
            console.log(`Subscription has expired or is no longer valid: ${subscription.endpoint}`);
            await Subscriptions.destroy({
                where: {
                    subscription_id: subscriptionId
                }
            });
        } else {
            console.error("Ошибка при отправке уведомления:", error);
        }
    }
}
async function scheduleNotifications() {
    const subscriptions = await Subscriptions.findAll();

    subscriptions.forEach(subscription => {
        const timezone = subscription.timezone;
        // // Настройка отправки уведомления в 20:00 по местному времени пользователя
        // const localTime = moment.tz('20:25', 'HH:mm', timezone); 

        // // Получение времени в формате CRON для сервера
        // const serverTime = localTime.clone().tz(moment.tz.guess()).format('m H * * *');
        // console.log(serverTime)
         // Настройка отправки уведомления в 20:25 по местному времени пользователя
        const localTime = moment.tz('20:00', 'HH:mm', timezone);
        
        // Преобразование местного времени в формат CRON в UTC
        const utcTime = localTime.utc();
        
        // Получение времени в формате CRON для сервера
        const serverTime = utcTime.format('m H * * *');
        
        console.log(`Local time: ${localTime.format('HH:mm')} (${timezone}) -> Server time: ${serverTime} (UTC)`);
        cron.schedule(serverTime, () => {
            sendNotificationToSubscription(subscription);
        });
    });
}

scheduleNotifications();
// Маршрут для очистки таблицы подписок
app.delete('/clear-subs', async (req, res) => {
    try {
        // Удаление всех записей из таблицы Subscriptions
        await Subscriptions.destroy({
            where: {},
            truncate: true // Используйте truncate для полной очистки таблицы
        });
        res.status(200).json({ message: 'Таблица подписок успешно очищена' });
    } catch (error) {
        console.error('Ошибка при очистке таблицы подписок:', error);
        res.status(500).json({ message: 'Ошибка сервера при очистке таблицы подписок' });
    }
});
app.listen(PORT, "0.0.0.0", () => {
    console.log('Connected to backend!')
})
