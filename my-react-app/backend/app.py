import string, random
from flask import *
import sqlite3
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

session_token = 'abc'

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('../migration/belay.db')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one:
            return rows[0]
        return rows
    return None

def validate_token():
    """validates the user's token and retrieves the user

    Returns:
        user_id(int) or null if not found
    """
    token = request.headers.get('Authorization') ### TODO use token or authorization?
    if session_token == token:
        return user_id
    return

def get_user_from_id(user_id):
    return query_db('select * from Users where id = ?', [user_id], one=True)

# TODO no need api keys ? store in sess token
def new_user(username, password):
    # This generate random user name, password, api_key
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into Users (name, password, api_key) ' +
        'values (?, ?, ?) returning id, name, password, api_key',
        (name, password, api_key),
        one=True)
    return u

# ------------------- API -------------------------
@app.route('/api/user/credential', methods=['GET'])
def get_credential():
    user = get_user_from_api_key(request)
    return jsonify(dict(user))

@app.route('/')
def index():
    return "Messaging App API"

@app.route('/api/auth', methods=['POST'])
def authenticate():
    """
    Path: /api/auth
    Method: POST
    Description: Accepts a username and password, authenticates the user, and returns a session token.
    Request Body: { "username": "user", "password": "pass" }
    Response: { "token": "session_token" }

    """
    session_token = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))

    # get new password
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
        try:
            user = query_db('''
        SELECT *
        FROM Users
        WHERE username = ? and password = ?
        ''', [username, password], one=True)
            if user: # found user
                USER_ID =  user["id"] # save USER_ID
                return jsonify({
                    'message': "User login",
                    'username': user['username'],
                    'password': user['password'],
                    'id': user['id'],
                    'token': session_token}), 200
            else:
                return jsonify({"message": "Invalid credentials"}), 401
        except Exception as e:
            return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

# ------------------- PROFILE -------------------------

# api for signing up -> return API-KEY
@app.route('/api/signup', methods=['POST']) #TODO ? create GET for when existing user /signup
def signup():
    """User coming in without Authentication. Sign up with username, password.
    """
    print("signup")

    # TODO if user already exist in database, send user to login...?

    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        try:
            user = query_db('''
        INSERT INTO Users (username, password)
        VALUES (?, ?) returning *
        ''', [username, password], one=True)
            return jsonify({"message": "Signed up successfully", "username": user['username'], "password": user['password']}), 200
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Username already taken'}), 400
        except Exception as e:
            return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 50

@app.route('/api/login', methods=['POST'])
def login():
    """Browswer coming in without API-KEY. Log in finds API-KEY that matches input username, password
"""
    return authenticate()

@app.route('/api/logout', methods=['POST'])
def logout():
    #TODO logout
    # If using tokens like JWT, consider implementing token invalidation on the backend when the user logs out, especially if you're using refresh tokens.
    return

# ------------------- CHANNELS -------------------------

@app.route('/api/channels', methods=['POST'])
# @require_api_key
def create_channel():
    """_summary_
    Description: Creates a new channel.
    Request Header: `Authorization: Bearer session_token` ## ASK?
    Request Body: { "name": "channel_name" }
    Response: { "id": channel_id, "name": "channel_name" }
    """
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            name = data.get('channel_name')
        try:
            new_channel = query_db('''
        INSERT INTO Channels (name)
        VALUES (?) returning *
        ''', [name], one=True)
            return jsonify({"message": "Channel created successfully", "id": new_channel['id'], "name": new_channel['name']}), 200
        except Exception as e:
            return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@app.route('/api/channels', methods=['GET'])
# @require_api_key
def get_channels():
    """
    Description: Retrieves a list of all channels.
    Request Header: Authorization: Bearer session_token
    Response: [{ "id": channel_id, "name": "channel_name" }]
    """
    channels = query_db('SELECT * FROM Channels', one=False)

    return jsonify([{'id': channel['id'], 'name': channel['name']} for channel in channels]), 200

# updating last read
@app.route('/api/channels/${channelId}/updateLastSeen', methods=['POST'])
# @require_api_key
def update_last_message_seen():
    """
    Description: update last message id seen
    Request Header: `Authorization: Bearer session_token`
    Request Body: { "channel_id": channel_id, "user_id": user_id, "last_message_id_seen": "last_message_id_seen"}
    Response: # TODO RESPONSE
    """
    if request.is_json:
        data = request.get_json()
        channel_id = data.get('channel_id')
        user_id = data.get('user_id')
        last_message_id_seen = data.get('last_message_id_seen')

    try:
        # query channel_id , and timestamp to find message_id
        message = query_db('''
        SELECT 1 FROM Users_Messages_Seen WHERE user_id = ? AND channel_id = ?
        '''
        , [user_id, channel_id], one=True)

        if message:
            # If a record exists, update it with the new last_message_id_seen
            query_db('UPDATE Users_Messages_Seen SET last_message_id_seen = ? WHERE user_id = ? AND channel_id = ?', (last_message_id_seen, user_id, channel_id), one=True)
        else:
            # If no record exists, insert a new one
            query_db('INSERT INTO Users_Messages_Seen (user_id, channel_id, last_message_id_seen) VALUES (?, ?, ?)', (user_id, channel_id, last_message_id_seen))

    except Exception as e:
        return jsonify({'error': f'An error occurred while updating last message seen: {e}'}), 500

    return

# ------------------- messages -------------------------

@app.route('/api/messages', methods=['POST'])
# @require_api_key
def post_message():
    """
    Request Header: `Authorization: Bearer session_token`
    Request Body: { "channel_id": channel_id, "content": "message_content", "replies_to": null or message_id }
    Response: { "id": message_id, "content": "message_content", "channel_id": channel_id, "user_id": user_id, "timestamp": "datetime", "replies_to": null or message_id }

    """

    if request.is_json:
        data = request.get_json()
        user_id = data.get('user_id')
        channel_id = data.get('channel_id')
        content = data.get('content')
        replies_to = data.get('replies_to', None)
    try:
        message = query_db('''
        INSERT INTO Messages (channel_id, user_id, content, replies_to)
        VALUES (?, ?, ?, ?) RETURNING *
        ''', (channel_id, user_id, content, replies_to), one=True)
        print(message)

        return jsonify({"message": "Message posted successfully", "id": message['id'], "content": message['content'], "channel_id": message['channel_id'], "user_id": message['user_id'], "timestamp": message['timestamp'], "replies_to": message['replies_to']}), 201
    except Exception as e:
        # Log the exception e
        return jsonify({'error': 'An error occurred while posting messages'}), 500


##### CAN ADD replies FIELD TO GET MESSAGE ?
@app.route('/api/messages', methods=['GET'])
# @require_api_key
def get_messages():
    """
    Description: Get all the messages in a room
    Request Header: `Authorization: Bearer session_token`
    Request Body: { "channel_id": channel_id }
    Response: # TODO CHECK
    [{ "id": message_id, "username": "username", "content": content, "user_id": user_id, "timestamp": "datetime", "replies_to": null or message_id },
    ...]

    """

    channel_id = request.args.get('channel_id')  # Assuming you pass room_id as a query parameter

    if not channel_id:
        return jsonify({'error': 'Channel ID not found'}), 400

    try:
        messages = query_db('select * from Messages where channel_id = ? AND replies_to IS NULL', [channel_id], one=False)
        # print(channel_id, messages)
        if not messages:
            return jsonify({'message': 'no message found'}), 200
        ls_messages = []
        for message in messages:
            user = get_user_from_id(message['user_id'])
            if not user:
                print("user id not found")
                continue
            # TODO check what to return
            ls_messages.append({'id': message['id'], 'username': user['username'], "timestamp": message['timestamp'], 'content': message['content']})
        # print(ls_messages)
        return jsonify(ls_messages), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while fetching messages: {e}'}), 500



# TODO testing
@app.route('/api/messages/unread_counts', methods=['GET'])
def unread_counts():
    # user = validate_token()
    # user_id = user['id']
    user_id = 1

    unread_by_channel = query_db("""
SELECT
    Channels.id AS channel_id,
    Channels.name,
    IFNULL(UnreadMessages.unread_count, 0) AS unread_count
FROM
    Channels
LEFT JOIN (
    SELECT
        Messages.channel_id,
        COUNT(Messages.id) AS unread_count
    FROM
        Messages
    LEFT JOIN Users_Messages_Seen
        ON Messages.channel_id = Users_Messages_Seen.channel_id
        AND Users_Messages_Seen.user_id = ?  -- Named placeholder
    WHERE
        Messages.id > Users_Messages_Seen.last_message_id_seen
        OR Users_Messages_Seen.last_message_id_seen IS NULL
    GROUP BY
        Messages.channel_id
) AS UnreadMessages ON Channels.id = UnreadMessages.channel_id
""", [user_id], one=False)
    channels_list = []
    for channel in unread_by_channel:
        channel_dict = {
            'id': channel["channel_id"],
            'name': channel["name"],
            'unread_count': channel["unread_count"]
        }
        channels_list.append(channel_dict)
    return jsonify(channels_list), 200


# TODO: api for reply to
@app.route('/api/messages/replies_to', methods=['GET'])
# @require_api_key
def replies_to_messages():
    """
    Description: Get replied messages for a particular message_id
    Request Header: `Authorization: Bearer session_token`
    Request Body: { "channel_id": channel_id, 'author': user['username'], "message_id": "message_id"}
    Response: # TODO CHECK
    { "id": message_id, "replies": [array of replies to this messages_id] }

    """
    # do querying
    ##### CAN ADD replies FIELD TO GET MESSAGE ?
    channel_id = request.args.get('channel_id')  # Assuming you pass room_id as a query parameter
    message_id = request.args.get('message_id')

    try:
        replies = query_db('select * from Messages where channel_id = ? AND replies_to = ?', [channel_id, message_id], one=False)
        # print(channel_id, messages)
        if not replies:
            return jsonify({'message': 'no message found'}), 200
        ls_replies = []
        for message in replies:
            user = get_user_from_id(message['user_id']) # get author
            if not user:
                print("user id not found")
                continue
            # TODO check what to return
            ls_replies.append({'message_id': message['id'], 'author': user['username'], 'content': message['content']})
        # print(ls_messages)
        return jsonify(ls_replies), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while fetching messages: {e}'}), 500

# ------------------- emoji -------------------------

@app.route('/api/messages/emoji', methods=['POST'])
# @require_api_key
def create_reaction():
    """
    Description: insert new emoji added by userX
    Request Header: `Authorization: Bearer session_token` ## ASK?
    Request Body: { "emoji": "emoji" , "message_id" : "message_id", "user_id": "user_id"}
    Response: { "message" : f"emoji {emoji} add to {message_id} successfully" }, 200

    """
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            emoji = data.get('emoji')
            message_id = data.get('message_id')
            user_id = data.get('user_id')
        try:
            new_reaction = query_db('''
        INSERT INTO Reactions (emoji, message_id, user_id)
        VALUES (?, ?, ?) returning *
        ''', [emoji, message_id, user_id], one=True)
            return jsonify({"message": f"Emoji {emoji} add to {message_id} successfully"}), 200
        except Exception as e:
            return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@app.route('/api/reactions/users', methods=['GET'])
# @require_api_key
def get_reaction():
    """
    Description: get user names from message_id and emoji
    Request Header: `Authorization: Bearer session_token` ## ASK?
    Request Body: { "emoji": "emoji" , "message_id" : "message_id"}
    Response: [user1, user2, user3, ... ], 200

    """
    emoji = request.args.get('emoji')
    message_id = request.args.get('message_id')

    try:
        users_reaction = query_db('''
    SELECT * FROM Reactions
    WHERE emoji=? AND message_id=?
    ''', [emoji, message_id], one=False)
        if users_reaction:
            users = []
            for row in users_reaction:
                user = get_user_from_id(row['user_id'])
                users.append(user['username'])
            print(users)
            return jsonify(users), 200
        else:
            return jsonify([]), 200

    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500
