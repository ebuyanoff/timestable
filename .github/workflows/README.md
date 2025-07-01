# В файлах
В консоли для всех проектов для редактирования через комп. Установить brew install awscli (единый для всех – он не нужен, только с компа)
Создать в корне сайта папку .github/workflows
Закинуть в эту папку без изменений файлы deploy.yml и readme прямо по примеру ecalc. Пушнуть.

# Консоль Yandex Cloud (1 раз)
Создать платёжный аккаунт и привязать карту

# YC Object Storage
Создать бакет: доступ на чтение – публичный, остальное – нет. ecalc.ru – точно по имени домена. Отдельный бакет для каждого сайта.
Настройки  => Веб-сайт => Хостинг (index.html 404.html)

# YC Identity and access management (1 раз)
Создать сервисный аккаунт без роли (единый для всех). Захожу в него, создать новый ключ => статический ключ доступа => скопировать СРАЗУ!!!


# YC Object Storage
Далее вернуться в бакет Безопасность => Права доступа => Назначить роли (внизу) и дать права сервисному аккаунту – storage.uploader и storage.viewer

# YC Cloud DNS
Зайти 
Настройки  => Веб-сайт => Домены в Cloud DNS

# Github
Github => Settings => Secrets and variables => Actions =>"New repository secret" (каждый по отдельности)
1. `AWS_S3_BUCKET` - название бакета S3
2. `AWS_ACCESS_KEY_ID` - ID ключа доступа AWS
3. `AWS_SECRET_ACCESS_KEY` - секретный ключ доступа AWS
4. `AWS_REGION` - регион AWS (по умолчанию 'us-east-1') Нужно: ru-central1
5. `AWS_S3_ENDPOINT` - эндпоинт S3 (необязательно, используется для совместимых с S3 хранилищ). Нужно:  https://storage.yandexcloud.net/

# REG.ru или доменного регистратора
Дальше прописать DNS у доменного регистратора
ns1.yandexcloud.net
ns2.yandexcloud.net

# YC Certificete manager
Создать сертификат => Cертификат от Let’s Encrypt
SSL => Создать сертификат (DNS)
Далее можно создать CNAME или TXT запись.

Вернуться в бакет => настройки => https => указать сертификат (когда появится)