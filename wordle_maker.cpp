#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;
#include <random>
#include <chrono>
typedef long long ll;
mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());

ll getRandomNumber(ll l, ll r)
{
    return uniform_int_distribution<ll>(l, r)(rng);
}

bool contain(string &s, char c)
{
    bool exist = 0;
    for (int i = 0; i < s.size(); i++)
    {
        if (s[i] == c)
        {
            exist = 1;
        }
    }
    return exist;
}

bool should_not_contain(string &s, char c)
{
    bool exist = 1;
    for (int i = 0; i < s.size(); i++)
    {
        if (s[i] == c)
        {
            exist = 0;
        }
    }
    return exist;
}

bool contain_at_pos(string &s, char c, int pos)
{
    bool exist = 0;

    if (s[pos - 1] == c)
    {
        exist = 1;
    }

    return exist;
}

bool contain_not_at_pos(string &s, char c, int pos)
{
    bool exist = 0;
    for (int i = 0; i < s.size(); i++)
    {
        if (s[i] == c && i != (pos - 1))
        {
            exist = 1;
        }
    }
    if (s[pos - 1] == c)
    {
        exist = 0;
    }
    return exist;
}

int main()
{
    ifstream file("/home/haze/Dev/worddlesolver/output.txt");
    if (!file.is_open())
    {
        std::cerr << "Error: Could not open file!" << std::endl;
        return 1;
    }

    std::vector<std::string> lines;
    std::string line;
    while (std::getline(file, line))
    {
        if (!line.empty() && line.back() == '\r')
        { // Trim CR if present
            line.pop_back();
        }
        lines.push_back(line);
    }
    int random_num = getRandomNumber(0, lines.size() - 1);
    cout << "A random word has been choosen by me :)" << endl;
    string word = lines[random_num];
    for (int i = 1; i <= 6; i++)
    {
        // gi3gn4ye3yg1yy5bk8
        cout << "Gives your guess for position " << i << endl;
        string t;
        cin >> t;
        string code = "";
        for (int j = 0; j < 5; j++)
        {
            int charac = t[j];
            if (contain_at_pos(word, charac, j + 1))
            {
                code += "g";
                code += charac;
                code += j + 1 + '0';
            }
            else if (contain(word, charac))
            {
                code += "y";
                code += charac;
                code += j + 1 + '0';
            }
            else
            {
                code += "b";
                code += charac;
                code += j + 1 + '0';
            }
        }

        bool CORRECT = 1;
        for (int t=0 ; t < code.length() ; t = t+3){
            if (code[t] != 'g'){
                CORRECT = 0;
            }
        }

        if (CORRECT){
            cout << endl << endl;
            cout << "You guessed the word :)" << endl;
            cout << "It was " << word << endl;
            return 0;
        }
        cout << code << endl;
    }

}