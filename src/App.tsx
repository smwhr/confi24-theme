
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

import { useQuery } from 'react-query'

import '@aws-amplify/ui-react/styles.css';
import './App.css'

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);


import { DataStore } from '@aws-amplify/datastore';
import { Theme, Vote } from './models';
import { useEffect, useState } from 'react';

type ThemeWithVote = Theme & {vote?: Vote};

function App({ signOut, user }:{signOut?:any, user?:any}) {


  const [themes, setThemes] = useState<Theme[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [themesWithVote, setThemesWithVote] = useState<ThemeWithVote[]>([])

  const { isLoading: themesLoading, error: themesError } = useQuery<any, QueryError, Theme[]>("themes", () =>{
    const models = DataStore.query(Theme);
    console.log(models);
    return models;
  }, {onSuccess: setThemes})

  const { isLoading: votesLoading, error: votesError } = useQuery<any, QueryError, Vote[]>("votes", () =>{
    const models = DataStore.query(Vote, (v) => v.userID.eq(user!.username));
    console.log(models);
    return models;
  }, {onSuccess: setVotes})

  const mergeThemesWithVote = themes.map( t => {
    const vote = votes.find(v => v.themeID == t.id)
    return {...t, vote: vote}
  })

  useEffect(() => {
    setThemesWithVote(mergeThemesWithVote)
  }, [themes, votes])


  if(themesLoading || themesError){
    return <div>chargement des thèmes...</div>
  }
  if(votesLoading || votesError){
    return <div>chargement de vos votes...</div>
  }

  /*
  
  */

  console.log(user)
  console.log(themes)
  console.log(votes)

  

  const voteFor = (theme: ThemeWithVote, value:number) => async () => {
    
    let newVote: Vote;
    if(theme.vote){
      newVote = await DataStore.save(
        Vote.copyOf(theme.vote, updated => {
          updated.value = value
        })
      );
    }else{
      const ballot = { "value": value,
        "themeID": theme.id,
        "userID": user!.username
      }
      newVote = await DataStore.save(
        new Vote(ballot)
      );
    }
    
    const newThemesWithVote = themesWithVote.map( t => {
      if(t == theme){
        return {...t, vote: newVote}
      }else{
        return t;
      }
    })
    setThemesWithVote(newThemesWithVote)
    
  }

  return (
    <>
      <p style={{"fontSize": "2em"}}>Vote pour le thème du Concours de fiction interactive francophone 2024</p>
      <p>Bonjour {user.attributes.preferred_username} <button onClick={signOut}>Sign out</button></p>
      
      <p>

      </p>

      <div>
        <table style={{"width": "100%"}}>
          <thead>
            <tr>
              <td><strong>Thème</strong></td>
              <td>&nbsp;</td>
              <td><strong>Votre vote</strong></td>
            </tr>
          </thead>
          <tbody>
            {themesWithVote.map(( t ) => {
              return <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <button onClick={voteFor(t, -1)}>-1</button>
                    <button onClick={voteFor(t, 0)}>0</button>
                    <button onClick={voteFor(t, +1)}>+1</button>
                  </td>
                  <td>{t.vote ? t.vote.value : <em>pas encore de vote</em>}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default withAuthenticator(App)
